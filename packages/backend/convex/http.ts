import type { WebhookEvent } from "@clerk/backend";
import { registerRoutes } from "@convex-dev/stripe";
import { httpRouter } from "convex/server";
import type Stripe from "stripe";
import { Webhook } from "svix";
import { components, internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { getStripe } from "./payments";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Error occured", { status: 400 });
    }
    switch (event.type) {
      case "user.created": // intentional fallthrough
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;

      case "user.deleted": {
        const clerkUserId = event.data.id!;
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });
        break;
      }

      case "organizationMembership.created": {
        const membership = event.data;
        await ctx.runMutation(internal.organizations.handleMembershipCreated, {
          clerkUserId: membership.public_user_data.user_id,
          clerkOrgId: membership.organization.id,
          orgRole: membership.role,
        });
        break;
      }
      case "organizationMembership.updated": {
        const membership = event.data;
        await ctx.runMutation(internal.organizations.handleMembershipUpdated, {
          clerkUserId: membership.public_user_data.user_id,
          clerkOrgId: membership.organization.id,
          orgRole: membership.role,
        });
        break;
      }
      case "organizationMembership.deleted": {
        const membership = event.data;
        await ctx.runMutation(internal.organizations.handleMembershipDeleted, {
          clerkUserId: membership.public_user_data.user_id,
          clerkOrgId: membership.organization.id,
        });
        break;
      }

      default:
        console.log("Ignored Clerk webhook event", event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

// Register Stripe webhook routes
registerRoutes(http, components.stripe, {
  webhookPath: "/stripe/webhook",
  events: {
    "checkout.session.completed": async (
      ctx,
      event: Stripe.CheckoutSessionCompletedEvent
    ) => {
      const session = event.data.object;
      const metadata = session.metadata;

      if (!metadata?.registrationId) {
        console.log("Checkout session missing registrationId metadata");
        return;
      }

      // Only process if payment was successful
      if (session.payment_status !== "paid") {
        console.log("Checkout session not paid:", session.id);
        return;
      }

      try {
        // Generate QR code data
        const qrCodeData = crypto.randomUUID();

        // Complete registration
        await ctx.runMutation(internal.registrations.completeRegistration, {
          registrationId: metadata.registrationId as any,
          stripePaymentId: (session.payment_intent as string) || session.id,
          qrCodeData,
        });

        // Send confirmation email
        await ctx.scheduler.runAfter(
          0,
          internal.emails.sendRegistrationConfirmationEmail,
          {
            registrationId: metadata.registrationId as any,
            qrCodeData,
          }
        );

        console.log("Payment processed successfully:", {
          registrationId: metadata.registrationId,
          sessionId: session.id,
        });
      } catch (error) {
        console.error("Error processing payment:", error);
        // Don't throw - let Stripe component handle the response
      }
    },
    "payment_intent.payment_failed": async (
      ctx,
      event: Stripe.PaymentIntentPaymentFailedEvent
    ) => {
      const paymentIntent = event.data.object;
      const metadata = paymentIntent.metadata;

      if (metadata?.registrationId) {
        try {
          await ctx.runMutation(internal.registrations.failRegistration, {
            registrationId: metadata.registrationId as any,
          });
          console.log(
            "Payment failed, registration marked as failed:",
            metadata.registrationId
          );
        } catch (error) {
          console.error("Error marking registration as failed:", error);
        }
      }
    },
  },
});

// Stripe Connect webhook for account events
http.route({
  path: "/stripe/connect-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripe = getStripe();
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_CONNECT_WEBHOOK_SECRET!,
      );
    } catch (err) {
      console.error("Stripe Connect webhook signature verification failed:", err);
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      await ctx.runMutation(internal.stripeConnect.handleAccountUpdated, {
        stripeAccountId: account.id,
        chargesEnabled: account.charges_enabled ?? false,
        payoutsEnabled: account.payouts_enabled ?? false,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

export default http;
