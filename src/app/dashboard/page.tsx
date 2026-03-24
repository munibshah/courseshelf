import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUserPurchases, getCourseById } from "@/lib/queries";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/shared/link-button";
import { formatPrice, formatDate } from "@/lib/utils";
import { BookOpen, PlayCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const purchases = await getUserPurchases(userId);

  // Fetch course details for each purchase
  const coursesWithPurchase = await Promise.all(
    purchases.map(async (purchase) => {
      const course = await getCourseById(purchase.course_id);
      return { purchase, course };
    })
  );

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
          <p className="mt-2 text-muted-foreground">
            Continue where you left off
          </p>
        </div>

        {coursesWithPurchase.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
              <div className="text-center">
                <h2 className="text-lg font-semibold">No courses yet</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse our catalog and enroll in your first course.
                </p>
              </div>
              <LinkButton href="/#courses" size="lg">
                Browse Courses
              </LinkButton>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coursesWithPurchase.map(({ purchase, course }) => {
              if (!course) return null;

              return (
                <Link
                  key={purchase.id}
                  href={`/courses/${course.id}/learn`}
                  className="group"
                >
                  <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      {course.thumbnail_url ? (
                        <Image
                          src={course.thumbnail_url}
                          alt={course.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <PlayCircle className="h-12 w-12 opacity-50" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="line-clamp-1 text-lg font-semibold">
                        {course.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {course.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between px-4 pb-4 pt-0">
                      <Badge variant="secondary">
                        Purchased {formatDate(purchase.created_at)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatPrice(purchase.amount)}
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
