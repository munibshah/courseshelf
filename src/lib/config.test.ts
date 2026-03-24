import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Environment Config", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("should export getConfig that returns all required env vars", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key-123");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key-456");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_abc");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_abc");
    vi.stubEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_test_abc");
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "cf-account-123");
    vi.stubEnv("CLOUDFLARE_R2_ACCESS_KEY_ID", "r2-key");
    vi.stubEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY", "r2-secret");
    vi.stubEnv("CLOUDFLARE_R2_BUCKET_NAME", "courseshelf");
    vi.stubEnv("CLOUDFLARE_STREAM_API_TOKEN", "stream-token");
    vi.stubEnv("RESEND_API_KEY", "re_123");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");

    const { getConfig } = await import("@/lib/config");
    const config = getConfig();

    expect(config.supabase.url).toBe("https://test.supabase.co");
    expect(config.supabase.anonKey).toBe("anon-key-123");
    expect(config.supabase.serviceRoleKey).toBe("service-key-456");
    expect(config.stripe.secretKey).toBe("sk_test_abc");
    expect(config.cloudflare.accountId).toBe("cf-account-123");
    expect(config.cloudflare.r2.accessKeyId).toBe("r2-key");
    expect(config.cloudflare.stream.apiToken).toBe("stream-token");
    expect(config.resend.apiKey).toBe("re_123");
    expect(config.app.url).toBe("http://localhost:3000");
  });

  it("should throw if a required env var is missing", async () => {
    // Don't set any env vars
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");

    const { getConfig } = await import("@/lib/config");
    expect(() => getConfig()).toThrow();
  });
});
