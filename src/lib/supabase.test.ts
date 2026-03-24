import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  })),
}));

describe("Supabase Client", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key-123");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key-456");
  });

  it("should export createBrowserClient function", async () => {
    const mod = await import("@/lib/supabase");
    expect(mod.createBrowserClient).toBeDefined();
    expect(typeof mod.createBrowserClient).toBe("function");
  });

  it("should export createServerClient function", async () => {
    const mod = await import("@/lib/supabase");
    expect(mod.createServerClient).toBeDefined();
    expect(typeof mod.createServerClient).toBe("function");
  });

  it("createBrowserClient should call createClient with public env vars", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const { createBrowserClient } = await import("@/lib/supabase");

    createBrowserClient();

    expect(createClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "anon-key-123"
    );
  });

  it("createServerClient should call createClient with service role key", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const { createServerClient } = await import("@/lib/supabase");

    createServerClient();

    expect(createClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "service-key-456"
    );
  });
});
