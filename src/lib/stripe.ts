import Stripe from "stripe";

/**
 * Strip all non-printable ASCII characters from a string.
 * Keeps only chars in the range 0x21 (!) – 0x7E (~). No spaces allowed in API keys.
 */
function sanitizeKey(raw: string): string {
  return raw.replace(/[^\x21-\x7E]/g, "");
}

export function getStripeClient(): Stripe {
  const raw = process.env.STRIPE_SECRET_KEY ?? "";
  const key = sanitizeKey(raw);

  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
  }
  return new Stripe(key, {
    apiVersion: "2026-02-25.clover",
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export function formatAmountForStripe(cents: number): number {
  return cents;
}

export function formatAmountFromStripe(cents: number): number {
  return cents / 100;
}
