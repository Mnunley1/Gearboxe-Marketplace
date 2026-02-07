import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export const formatAmountForStripe = (amount: number): number =>
  Math.round(amount * 100);

export const formatAmountFromStripe = (amount: number): number => amount / 100;
