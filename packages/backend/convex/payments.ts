import { action } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { StripeSubscriptions } from "@convex-dev/stripe";
import { internal } from "./_generated/api";
import Stripe from "stripe";

const stripeClient = new StripeSubscriptions(components.stripe, {});
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

/**
 * Create a checkout session for event registration payment
 * Uses Stripe SDK directly for dynamic pricing, but leverages component for customer management
 */
export const createEventRegistrationCheckout = action({
  args: {
    registrationId: v.id("registrations"),
    eventId: v.id("events"),
    vehicleId: v.id("vehicles"),
    userId: v.id("users"),
    amount: v.number(), // Amount in dollars (will be converted to cents)
  },
  returns: v.object({
    sessionId: v.string(),
    url: v.string(),
  }),
  handler: async (ctx, args) => {
    // Verify registration exists and is pending
    const registration = await ctx.runQuery(
      internal.registrations.getRegistrationById,
      { id: args.registrationId }
    );
    
    if (!registration || registration.registration.paymentStatus !== "pending") {
      throw new Error("Invalid registration or already paid");
    }
    
    // Get user details
    const user = await ctx.runQuery(internal.users.getUserById, {
      id: args.userId,
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get event details
    const event = await ctx.runQuery(internal.events.getEventById, {
      id: args.eventId,
    });
    
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Get vehicle details
    const vehicle = await ctx.runQuery(internal.vehicles.getVehicleById, {
      id: args.vehicleId,
    });
    
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    
    // Get or create Stripe customer using component
    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: user.externalId, // Use Clerk ID
      email: user.email,
      name: user.name,
    });
    
    // Create checkout session using Stripe SDK directly for dynamic pricing
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/myAccount/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/myAccount/payment?registrationId=${args.registrationId}`;
    
    const session = await stripe.checkout.sessions.create({
      customer: customer.customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Event Registration - ${event.name}`,
              description: `Registration for ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            },
            unit_amount: Math.round(args.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        registrationId: args.registrationId,
        eventId: args.eventId,
        vehicleId: args.vehicleId,
        userId: args.userId,
      },
      customer_email: user.email,
    });
    
    return {
      sessionId: session.id,
      url: session.url!,
    };
  },
});
