import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getLessonsByCourseId,
  createLesson,
  reorderLessons,
} from "@/lib/queries";

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? "").split(",").filter(Boolean);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { courseId } = await params;
    const lessons = await getLessonsByCourseId(courseId);
    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Failed to fetch lessons:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { courseId } = await params;
    const body = await req.json();
    const { title, description, video_uid, position, is_preview } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const lesson = await createLesson({
      course_id: courseId,
      title,
      description: description ?? null,
      video_uid: video_uid ?? "",
      position: position ?? 0,
      is_preview: is_preview ?? false,
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Failed to create lesson:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Reorder lessons
    const body = await req.json();
    const { lessons } = body as {
      lessons: { id: string; position: number }[];
    };

    if (!lessons || !Array.isArray(lessons)) {
      return NextResponse.json(
        { error: "lessons array is required" },
        { status: 400 }
      );
    }

    await reorderLessons(lessons);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder lessons:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
