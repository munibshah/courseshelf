import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("Cloudflare Stream Client", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    mockFetch.mockReset();
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "cf-account-123");
    vi.stubEnv("CLOUDFLARE_STREAM_API_TOKEN", "stream-token-456");
  });

  it("should export getStreamBaseUrl that includes account ID", async () => {
    const { getStreamBaseUrl } = await import("@/lib/cloudflare-stream");
    const url = getStreamBaseUrl();
    expect(url).toBe(
      "https://api.cloudflare.com/client/v4/accounts/cf-account-123/stream"
    );
  });

  it("should export getStreamHeaders with auth token", async () => {
    const { getStreamHeaders } = await import("@/lib/cloudflare-stream");
    const headers = getStreamHeaders();
    expect(headers).toEqual({
      Authorization: "Bearer stream-token-456",
    });
  });

  it("should export requestDirectCreatorUpload that returns upload URL and video uid", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        result: {
          uid: "video-uid-abc",
          uploadURL: "https://upload.cloudflarestream.com/direct-upload-url",
        },
        success: true,
      }),
    });

    const { requestDirectCreatorUpload } = await import(
      "@/lib/cloudflare-stream"
    );
    const result = await requestDirectCreatorUpload({ maxDurationSeconds: 3600 });

    expect(result.uid).toBe("video-uid-abc");
    expect(result.uploadURL).toBe(
      "https://upload.cloudflarestream.com/direct-upload-url"
    );
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/cf-account-123/stream/direct_upload",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer stream-token-456",
        }),
      })
    );
  });

  it("should export getVideoDetails that fetches video info by uid", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        result: {
          uid: "video-uid-abc",
          status: { state: "ready" },
          duration: 120.5,
          thumbnail: "https://cloudflarestream.com/thumb.jpg",
          playback: { hls: "https://cloudflarestream.com/hls.m3u8" },
        },
        success: true,
      }),
    });

    const { getVideoDetails } = await import("@/lib/cloudflare-stream");
    const result = await getVideoDetails("video-uid-abc");

    expect(result.uid).toBe("video-uid-abc");
    expect(result.status.state).toBe("ready");
    expect(result.duration).toBe(120.5);
  });

  it("should throw on API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });

    const { getVideoDetails } = await import("@/lib/cloudflare-stream");
    await expect(getVideoDetails("bad-uid")).rejects.toThrow(
      "Cloudflare Stream API error: 401 Unauthorized"
    );
  });
});
