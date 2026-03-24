import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: "email-123" }),
    },
  })),
}));

describe("Email Client", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.stubEnv("RESEND_API_KEY", "re_test_123");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  });

  it("should export getEmailClient that returns a Resend instance", async () => {
    const { getEmailClient } = await import("@/lib/email");
    const client = getEmailClient();
    expect(client).toBeDefined();
    expect(client.emails).toBeDefined();
  });

  it("should initialize Resend with the API key", async () => {
    const { Resend } = await import("resend");
    const { getEmailClient } = await import("@/lib/email");

    getEmailClient();

    expect(Resend).toHaveBeenCalledWith("re_test_123");
  });

  it("should export sendPurchaseConfirmation that sends an email", async () => {
    const { sendPurchaseConfirmation } = await import("@/lib/email");

    const result = await sendPurchaseConfirmation({
      to: "student@example.com",
      courseName: "Learn TypeScript",
      amount: 4999,
    });

    expect(result).toEqual({ id: "email-123" });
  });

  it("should export sendWelcomeEmail", async () => {
    const { sendWelcomeEmail } = await import("@/lib/email");

    const result = await sendWelcomeEmail({
      to: "newuser@example.com",
      name: "John",
    });

    expect(result).toEqual({ id: "email-123" });
  });
});
