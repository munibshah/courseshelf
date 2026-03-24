import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requestDirectCreatorUpload } from "@/lib/cloudflare-stream";

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? "").split(",").filter(Boolean);

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await requestDirectCreatorUpload({
      maxDurationSeconds: 3600,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to create upload URL:", error);
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 }
    );
  }
}
