import { v } from "convex/values";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import {
	action,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { requireOrgAdmin, requireSuperAdmin } from "./users";

/** Extract org ID from JWT identity in an action context */
async function requireOrgAdminAction(ctx: ActionCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new Error("Unauthorized: not authenticated");
	}
	const orgId = (identity as any).org_id as string | undefined;
	if (!orgId) {
		throw new Error("Unauthorized: no active organization selected");
	}
	return { orgId };
}

function getStripe() {
	return new Stripe(process.env.STRIPE_SECRET_KEY!, {
		apiVersion: "2024-12-18.acacia",
	});
}

/**
 * Get the Stripe Connect settings for the current org
 */
export const getOrgStripeSettings = query({
	args: {},
	handler: async (ctx) => {
		const { orgId } = await requireOrgAdmin(ctx);
		return await ctx.db
			.query("orgStripeSettings")
			.withIndex("by_org", (q) => q.eq("clerkOrgId", orgId))
			.unique();
	},
});

/**
 * Get Stripe settings for a specific org (internal use)
 */
export const getSettingsByOrgId = internalQuery({
	args: { clerkOrgId: v.string() },
	handler: async (ctx, args) => await ctx.db
			.query("orgStripeSettings")
			.withIndex("by_org", (q) => q.eq("clerkOrgId", args.clerkOrgId))
			.unique(),
});

/**
 * Get all org Stripe settings (superAdmin only, for fee management)
 */
export const getAllOrgStripeSettings = query({
	args: {},
	handler: async (ctx) => {
		await requireSuperAdmin(ctx);
		return await ctx.db.query("orgStripeSettings").collect();
	},
});

/**
 * Create a Stripe Connected Account and return the onboarding URL
 */
export const createConnectAccount = action({
	args: {},
	returns: v.object({
		accountId: v.string(),
		onboardingUrl: v.string(),
	}),
	handler: async (ctx) => {
		const { orgId } = await requireOrgAdminAction(ctx);

		// Check if org already has a Stripe account
		const existing = await ctx.runQuery(
			internal.stripeConnect.getSettingsByOrgId,
			{ clerkOrgId: orgId },
		);
		if (existing) {
			throw new Error(
				"Organization already has a Stripe Connect account. Use the onboarding link to complete setup.",
			);
		}

		const stripe = getStripe();

		// Create a Stripe Connect Express account
		const account = await stripe.accounts.create({
			type: "express",
			metadata: {
				clerkOrgId: orgId,
			},
		});

		// Store the account in the database
		await ctx.runMutation(internal.stripeConnect.insertOrgStripeSettings, {
			clerkOrgId: orgId,
			stripeAccountId: account.id,
		});

		// Create an account link for onboarding
		const accountLink = await stripe.accountLinks.create({
			account: account.id,
			refresh_url: `${process.env.NEXT_PUBLIC_ADMIN_URL}/settings/stripe?refresh=true`,
			return_url: `${process.env.NEXT_PUBLIC_ADMIN_URL}/settings/stripe?success=true`,
			type: "account_onboarding",
		});

		return {
			accountId: account.id,
			onboardingUrl: accountLink.url,
		};
	},
});

/**
 * Create a new onboarding link for an existing connected account
 */
export const createConnectOnboardingLink = action({
	args: {},
	returns: v.object({
		onboardingUrl: v.string(),
	}),
	handler: async (ctx) => {
		const { orgId } = await requireOrgAdminAction(ctx);

		const settings = await ctx.runQuery(
			internal.stripeConnect.getSettingsByOrgId,
			{ clerkOrgId: orgId },
		);
		if (!settings) {
			throw new Error(
				"No Stripe Connect account found. Please create one first.",
			);
		}

		const stripe = getStripe();
		const accountLink = await stripe.accountLinks.create({
			account: settings.stripeAccountId,
			refresh_url: `${process.env.NEXT_PUBLIC_ADMIN_URL}/settings/stripe?refresh=true`,
			return_url: `${process.env.NEXT_PUBLIC_ADMIN_URL}/settings/stripe?success=true`,
			type: "account_onboarding",
		});

		return {
			onboardingUrl: accountLink.url,
		};
	},
});

/**
 * Insert org Stripe settings (internal, called from action)
 */
export const insertOrgStripeSettings = internalMutation({
	args: {
		clerkOrgId: v.string(),
		stripeAccountId: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("orgStripeSettings", {
			clerkOrgId: args.clerkOrgId,
			stripeAccountId: args.stripeAccountId,
			onboardingComplete: false,
			platformFeeType: "percentage",
			platformFeeValue: 10, // Default 10% platform fee
			createdAt: Date.now(),
		});
	},
});

/**
 * Handle Stripe Connect webhook: account.updated
 * Sets onboardingComplete when charges_enabled && payouts_enabled
 */
export const handleAccountUpdated = internalMutation({
	args: {
		stripeAccountId: v.string(),
		chargesEnabled: v.boolean(),
		payoutsEnabled: v.boolean(),
	},
	handler: async (ctx, args) => {
		const settings = await ctx.db
			.query("orgStripeSettings")
			.withIndex("by_stripe_account", (q) =>
				q.eq("stripeAccountId", args.stripeAccountId),
			)
			.unique();

		if (!settings) {
			console.log(
				"No org settings found for Stripe account:",
				args.stripeAccountId,
			);
			return;
		}

		const onboardingComplete =
			args.chargesEnabled && args.payoutsEnabled;

		if (settings.onboardingComplete !== onboardingComplete) {
			await ctx.db.patch(settings._id, { onboardingComplete });
			console.log(
				`Stripe Connect onboarding status updated for org ${settings.clerkOrgId}: ${onboardingComplete}`,
			);
		}
	},
});

/**
 * Update platform fee for an org (superAdmin only)
 */
export const updatePlatformFee = mutation({
	args: {
		orgStripeSettingsId: v.id("orgStripeSettings"),
		platformFeeType: v.union(v.literal("percentage"), v.literal("fixed")),
		platformFeeValue: v.number(),
	},
	handler: async (ctx, args) => {
		await requireSuperAdmin(ctx);

		const settings = await ctx.db.get(args.orgStripeSettingsId);
		if (!settings) {
			throw new Error("Org Stripe settings not found");
		}

		if (args.platformFeeType === "percentage") {
			if (args.platformFeeValue < 0 || args.platformFeeValue > 100) {
				throw new Error("Percentage fee must be between 0 and 100");
			}
		} else if (args.platformFeeValue < 0) {
				throw new Error("Fixed fee must be non-negative");
			}

		await ctx.db.patch(args.orgStripeSettingsId, {
			platformFeeType: args.platformFeeType,
			platformFeeValue: args.platformFeeValue,
		});
	},
});
