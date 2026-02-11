import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const handleMembershipCreated = internalMutation({
  args: {
    clerkUserId: v.string(),
    clerkOrgId: v.string(),
    orgRole: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", args.clerkUserId))
      .unique();
    if (!user) {
      console.warn(
        `Organization membership created for unknown user: ${args.clerkUserId}`
      );
      return;
    }

    const existing = await ctx.db
      .query("orgMemberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", user._id).eq("clerkOrgId", args.clerkOrgId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { orgRole: args.orgRole });
    } else {
      await ctx.db.insert("orgMemberships", {
        userId: user._id,
        clerkOrgId: args.clerkOrgId,
        orgRole: args.orgRole,
        createdAt: Date.now(),
      });
    }
  },
});

export const handleMembershipUpdated = internalMutation({
  args: {
    clerkUserId: v.string(),
    clerkOrgId: v.string(),
    orgRole: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", args.clerkUserId))
      .unique();
    if (!user) return;

    const membership = await ctx.db
      .query("orgMemberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", user._id).eq("clerkOrgId", args.clerkOrgId)
      )
      .first();

    if (membership) {
      await ctx.db.patch(membership._id, { orgRole: args.orgRole });
    }
  },
});

export const handleMembershipDeleted = internalMutation({
  args: {
    clerkUserId: v.string(),
    clerkOrgId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", args.clerkUserId))
      .unique();
    if (!user) return;

    const membership = await ctx.db
      .query("orgMemberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", user._id).eq("clerkOrgId", args.clerkOrgId)
      )
      .first();

    if (membership) {
      await ctx.db.delete(membership._id);
    }
  },
});
