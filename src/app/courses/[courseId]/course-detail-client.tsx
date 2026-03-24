"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn, formatPrice } from "@/lib/utils";
import { PlayCircle, Lock, Eye, CheckCircle, Loader2 } from "lucide-react";
import type { Course, Lesson } from "@/types/models";

interface CourseDetailClientProps {
  course: Course;
  lessons: Lesson[];
  hasPurchased: boolean;
  isSignedIn: boolean;
}

export function CourseDetailClient({
  course,
  lessons,
  hasPurchased,
  isSignedIn,
}: CourseDetailClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const previewLessons = lessons.filter((l) => l.is_preview);
  const lockedLessons = lessons.filter((l) => !l.is_preview);

  async function handleCheckout() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });
      const data = await res.json();

      if (data.alreadyPurchased) {
        router.push(data.redirectUrl);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero Banner */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-2 md:py-20">
          {/* Left: Course Info */}
          <div className="flex flex-col justify-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {course.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {course.description}
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-base px-3 py-1">
                {formatPrice(course.price)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
              </span>
              {previewLessons.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  · {previewLessons.length} free preview
                  {previewLessons.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Right: Thumbnail + CTA */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              {course.thumbnail_url ? (
                <Image
                  src={course.thumbnail_url}
                  alt={course.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <PlayCircle className="h-16 w-16 opacity-50" />
                </div>
              )}
            </div>

            {/* CTA */}
            {hasPurchased ? (
              <Link
                href={`/courses/${course.id}/learn`}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full text-base"
                )}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Continue Learning
              </Link>
            ) : isSignedIn ? (
              <Button
                size="lg"
                className="w-full text-base"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : null}
                Enroll Now — {formatPrice(course.price)}
              </Button>
            ) : (
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full text-base"
                )}
              >
                Sign Up to Enroll — {formatPrice(course.price)}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">Curriculum</h2>

        {lessons.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No lessons available yet. Check back soon!
            </CardContent>
          </Card>
        ) : (
          <Accordion defaultValue={[0]}>
            {lessons.map((lesson, index) => {
              const canAccess = hasPurchased || lesson.is_preview;

              return (
                <AccordionItem key={lesson.id} value={index}>
                  <AccordionTrigger className="px-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-left">{lesson.title}</span>
                      {lesson.is_preview && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          <Eye className="mr-1 h-3 w-3" />
                          Free Preview
                        </Badge>
                      )}
                      {!canAccess && (
                        <Lock className="ml-auto h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <div className="flex items-start justify-between gap-4 pl-10">
                      <p className="text-muted-foreground">
                        {lesson.description || "No description provided."}
                      </p>
                      {canAccess && (
                        <Link
                          href={`/courses/${course.id}/learn?lesson=${lesson.id}`}
                          className={cn(
                            buttonVariants({
                              variant: "outline",
                              size: "sm",
                            })
                          )}
                        >
                          <PlayCircle className="mr-1 h-4 w-4" />
                          {lesson.is_preview ? "Watch Preview" : "Watch"}
                        </Link>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </section>
    </main>
  );
}
