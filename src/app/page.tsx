import { HeroSection } from "@/components/landing/hero-section";
import { CourseCard } from "@/components/landing/course-card";
import { getPublishedCourses } from "@/lib/queries";
import type { Course } from "@/types/models";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let courses: Course[] = [];
  try {
    courses = await getPublishedCourses();
  } catch {
    // Fallback: show empty state if Supabase isn't connected yet
    courses = [];
  }

  return (
    <main className="min-h-screen">
      <HeroSection />
      <section id="courses" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-8 text-2xl font-bold tracking-tight">
          Featured Courses
        </h2>
        {courses.length === 0 ? (
          <p className="text-muted-foreground">
            No courses available yet. Check back soon!
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
