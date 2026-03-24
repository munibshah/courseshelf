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

  // Diagnostic logging — remove after debugging
  console.log("[Stripe Debug] raw length:", raw.length);
  console.log("[Stripe Debug] sanitized length:", key.length);
  console.log("[Stripe Debug] starts with sk_test_:", key.startsWith("sk_test_"));
  console.log("[Stripe Debug] first 15 chars:", key.slice(0, 15));
  console.log(
    "[Stripe Debug] raw char codes (last 10):",
    [...raw.slice(-10)].map((c) => c.charCodeAt(0))
  );

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
