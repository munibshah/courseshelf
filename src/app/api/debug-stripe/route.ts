import { NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Diagnostic endpoint to debug Stripe connectivity on Vercel.
 * DELETE THIS ROUTE after debugging is complete.
 */
export async function GET() {
  const raw = process.env.STRIPE_SECRET_KEY ?? "";
  const sanitized = raw.replace(/[^\x21-\x7E]/g, "");

  const diagnostics: Record<string, unknown> = {
    rawLength: raw.length,
    sanitizedLength: sanitized.length,
    startsWithSkTest: sanitized.startsWith("sk_test_"),
    first15: sanitized.slice(0, 15),
    last5: sanitized.slice(-5),
    rawCharCodesFirst20: [...raw.slice(0, 20)].map((c) => c.charCodeAt(0)),
    rawCharCodesLast10: [...raw.slice(-10)].map((c) => c.charCodeAt(0)),
    removedChars: raw.length - sanitized.length,
  };

  // Test 1: Raw fetch to Stripe with the sanitized key
  try {
    const res = await fetch("https://api.stripe.com/v1/balance", {
      headers: {
        Authorization: `Bearer ${sanitized}`,
      },
    });
    const body = await res.json();
    diagnostics.fetchTest = {
      status: res.status,
      ok: res.ok,
      body: res.ok ? "success" : body,
    };
  } catch (err) {
    diagnostics.fetchTest = {
      error: err instanceof Error ? err.message : String(err),
      code: (err as NodeJS.ErrnoException).code,
    };
  }

  // Test 2: Try Stripe SDK with fetch client
  try {
    const stripe = new Stripe(sanitized, {
      apiVersion: "2026-02-25.clover",
      httpClient: Stripe.createFetchHttpClient(),
    });
    const balance = await stripe.balance.retrieve();
    diagnostics.sdkFetchTest = { success: true, available: balance.available?.length };
  } catch (err) {
    diagnostics.sdkFetchTest = {
      error: err instanceof Error ? err.message : String(err),
      type: (err as { type?: string }).type,
      code: (err as NodeJS.ErrnoException).code,
    };
  }

  // Test 3: Try Stripe SDK with default (node http) client
  try {
    const stripe = new Stripe(sanitized, {
      apiVersion: "2026-02-25.clover",
    });
    const balance = await stripe.balance.retrieve();
    diagnostics.sdkNodeTest = { success: true, available: balance.available?.length };
  } catch (err) {
    diagnostics.sdkNodeTest = {
      error: err instanceof Error ? err.message : String(err),
      type: (err as { type?: string }).type,
      code: (err as NodeJS.ErrnoException).code,
    };
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
