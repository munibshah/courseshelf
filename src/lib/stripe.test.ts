import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("stripe", () => ({
  default: vi.fn().mockImplementation((key, options) => ({
    _key: key,
    _options: options,
    checkout: { sessions: { create: vi.fn() } },
    webhooks: { constructEvent: vi.fn() },
  })),
}));

describe("Stripe Client", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_abc123");
  });

  it("should export getStripeClient that returns a Stripe instance", async () => {
    const { getStripeClient } = await import("@/lib/stripe");
    const client = getStripeClient();
    expect(client).toBeDefined();
    expect(client.checkout).toBeDefined();
  });

  it("should initialize Stripe with the secret key", async () => {
    const Stripe = (await import("stripe")).default;
    const { getStripeClient } = await import("@/lib/stripe");

    getStripeClient();

    expect(Stripe).toHaveBeenCalledWith("sk_test_abc123", {
      apiVersion: "2026-02-25.clover",
    });
  });

  it("should trim whitespace from the secret key", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "  sk_test_abc123\n");
    const Stripe = (await import("stripe")).default;
    const { getStripeClient } = await import("@/lib/stripe");

    getStripeClient();

    expect(Stripe).toHaveBeenCalledWith("sk_test_abc123", {
      apiVersion: "2026-02-25.clover",
    });
  });

  it("should throw if STRIPE_SECRET_KEY is missing", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    const { getStripeClient } = await import("@/lib/stripe");
    expect(() => getStripeClient()).toThrow("Missing STRIPE_SECRET_KEY");
  });

  it("should export formatAmountForStripe to convert cents", async () => {
    const { formatAmountForStripe } = await import("@/lib/stripe");
    expect(formatAmountForStripe(4999)).toBe(4999);
    expect(formatAmountForStripe(0)).toBe(0);
  });

  it("should export formatAmountFromStripe to convert from cents to dollars", async () => {
    const { formatAmountFromStripe } = await import("@/lib/stripe");
    expect(formatAmountFromStripe(4999)).toBe(49.99);
    expect(formatAmountFromStripe(1000)).toBe(10.0);
  });
});
