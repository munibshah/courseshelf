export function getStreamBaseUrl(): string {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`;
}

export function getStreamHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN!}`,
  };
}

interface DirectUploadOptions {
  maxDurationSeconds?: number;
}

interface DirectUploadResult {
  uid: string;
  uploadURL: string;
}

export async function requestDirectCreatorUpload(
  options: DirectUploadOptions = {}
): Promise<DirectUploadResult> {
  const { maxDurationSeconds = 3600 } = options;

  const response = await fetch(`${getStreamBaseUrl()}/direct_upload`, {
    method: "POST",
    headers: {
      ...getStreamHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ maxDurationSeconds }),
  });

  if (!response.ok) {
    throw new Error(
      `Cloudflare Stream API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return {
    uid: data.result.uid,
    uploadURL: data.result.uploadURL,
  };
}

interface VideoDetails {
  uid: string;
  status: { state: string };
  duration: number;
  thumbnail: string;
  playback: { hls: string };
}

export async function getVideoDetails(uid: string): Promise<VideoDetails> {
  const response = await fetch(`${getStreamBaseUrl()}/${uid}`, {
    headers: getStreamHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Cloudflare Stream API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.result;
}
