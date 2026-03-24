import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCourseById, getLessonsByCourseId, getUserPurchaseForCourse } from "@/lib/queries";
import { CourseDetailClient } from "./course-detail-client";

export const dynamic = "force-dynamic";

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);

  if (!course || !course.published) {
    notFound();
  }

  const lessons = await getLessonsByCourseId(courseId);

  let hasPurchased = false;
  const { userId } = await auth();
  if (userId) {
    const purchase = await getUserPurchaseForCourse(userId, courseId);
    hasPurchased = !!purchase;
  }

  return (
    <CourseDetailClient
      course={course}
      lessons={lessons}
      hasPurchased={hasPurchased}
      isSignedIn={!!userId}
    />
  );
}
