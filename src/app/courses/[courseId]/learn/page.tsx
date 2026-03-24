import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import {
  getCourseById,
  getLessonsByCourseId,
  getUserPurchaseForCourse,
} from "@/lib/queries";
import { VideoPlayerClient } from "./video-player-client";

export const dynamic = "force-dynamic";

interface LearnPageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default async function LearnPage({
  params,
  searchParams,
}: LearnPageProps) {
  const { courseId } = await params;
  const { lesson: lessonId } = await searchParams;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const course = await getCourseById(courseId);
  if (!course) notFound();

  const lessons = await getLessonsByCourseId(courseId);
  const purchase = await getUserPurchaseForCourse(userId, courseId);
  const hasPurchased = !!purchase;

  // Determine active lesson
  let activeLesson = lessons[0] ?? null;
  if (lessonId) {
    const found = lessons.find((l) => l.id === lessonId);
    if (found) activeLesson = found;
  }

  // If not purchased, only allow preview lessons
  if (!hasPurchased && activeLesson && !activeLesson.is_preview) {
    redirect(`/courses/${courseId}`);
  }

  return (
    <VideoPlayerClient
      course={course}
      lessons={lessons}
      activeLesson={activeLesson}
      hasPurchased={hasPurchased}
    />
  );
}
