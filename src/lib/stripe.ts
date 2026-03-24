import Stripe from "stripe";

export function getStripeClient(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
}

export function formatAmountForStripe(cents: number): number {
  return cents;
}

export function formatAmountFromStripe(cents: number): number {
  return cents / 100;
}
