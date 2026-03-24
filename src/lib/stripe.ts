import Stripe from "stripe";

export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
  }
  return new Stripe(key, {
    apiVersion: "2026-02-25.clover",
  });
}

export function formatAmountForStripe(cents: number): number {
  return cents;
}

export function formatAmountFromStripe(cents: number): number {
  return cents / 100;
}
