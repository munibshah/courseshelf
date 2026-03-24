import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn().mockImplementation((config) => ({
    _config: config,
    send: vi.fn(),
  })),
  PutObjectCommand: vi.fn().mockImplementation((input) => ({ input })),
  GetObjectCommand: vi.fn().mockImplementation((input) => ({ input })),
  DeleteObjectCommand: vi.fn().mockImplementation((input) => ({ input })),
}));

describe("Cloudflare R2 Client", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "cf-account-123");
    vi.stubEnv("CLOUDFLARE_R2_ACCESS_KEY_ID", "r2-key");
    vi.stubEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY", "r2-secret");
    vi.stubEnv("CLOUDFLARE_R2_BUCKET_NAME", "courseshelf");
  });

  it("should export getR2Client that returns an S3Client", async () => {
    const { getR2Client } = await import("@/lib/cloudflare-r2");
    const client = getR2Client();
    expect(client).toBeDefined();
  });

  it("should configure S3Client with R2 endpoint", async () => {
    const { S3Client } = await import("@aws-sdk/client-s3");
    const { getR2Client } = await import("@/lib/cloudflare-r2");

    getR2Client();

    expect(S3Client).toHaveBeenCalledWith(
      expect.objectContaining({
        region: "auto",
        endpoint: "https://cf-account-123.r2.cloudflarestorage.com",
        credentials: {
          accessKeyId: "r2-key",
          secretAccessKey: "r2-secret",
        },
      })
    );
  });

  it("should export getUploadUrl that builds a key path", async () => {
    const { getUploadKey } = await import("@/lib/cloudflare-r2");
    const key = getUploadKey("thumbnails", "course-1", "image.jpg");
    expect(key).toBe("thumbnails/course-1/image.jpg");
  });

  it("should export getBucketName", async () => {
    const { getBucketName } = await import("@/lib/cloudflare-r2");
    expect(getBucketName()).toBe("courseshelf");
  });
});
