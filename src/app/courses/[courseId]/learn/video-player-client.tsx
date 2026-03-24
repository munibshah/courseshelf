"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PlayCircle,
  Lock,
  Eye,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import type { Course, Lesson } from "@/types/models";

interface VideoPlayerClientProps {
  course: Course;
  lessons: Lesson[];
  activeLesson: Lesson | null;
  hasPurchased: boolean;
}

export function VideoPlayerClient({
  course,
  lessons,
  activeLesson,
  hasPurchased,
}: VideoPlayerClientProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeIndex = activeLesson
    ? lessons.findIndex((l) => l.id === activeLesson.id)
    : -1;
  const nextLesson = activeIndex >= 0 ? lessons[activeIndex + 1] : null;

  function navigateToLesson(lesson: Lesson) {
    router.push(`/courses/${course.id}/learn?lesson=${lesson.id}`);
  }

  function handleVideoEnd() {
    if (nextLesson && (hasPurchased || nextLesson.is_preview)) {
      navigateToLesson(nextLesson);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row">
      {/* Video Area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center gap-3 border-b px-4 py-2">
          <Link
            href={`/courses/${course.id}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" })
            )}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
          <span className="text-sm font-medium truncate">
            {course.title}
          </span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "ml-auto md:hidden"
            )}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Video Player */}
        <div className="flex flex-1 items-center justify-center bg-black">
          {activeLesson?.video_uid ? (
            <iframe
              src={`https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE ?? "f"}.cloudflarestream.com/${activeLesson.video_uid}/iframe`}
              className="aspect-video w-full max-h-full"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              onLoad={() => {
                // Listen for video end events via postMessage
                const handler = (e: MessageEvent) => {
                  if (
                    typeof e.data === "object" &&
                    e.data?.type === "ended"
                  ) {
                    handleVideoEnd();
                  }
                };
                window.addEventListener("message", handler);
                return () =>
                  window.removeEventListener("message", handler);
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-white/60">
              <PlayCircle className="h-16 w-16" />
              <p>
                {activeLesson
                  ? "Video not available yet"
                  : "Select a lesson to start"}
              </p>
            </div>
          )}
        </div>

        {/* Lesson info + next */}
        {activeLesson && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div>
              <h2 className="font-semibold">{activeLesson.title}</h2>
              {activeLesson.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {activeLesson.description}
                </p>
              )}
            </div>
            {nextLesson && (hasPurchased || nextLesson.is_preview) && (
              <button
                onClick={() => navigateToLesson(nextLesson)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" })
                )}
              >
                Next Lesson →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sidebar: Lesson List */}
      <aside
        className={cn(
          "w-full border-l bg-card md:w-80 overflow-y-auto transition-all",
          sidebarOpen
            ? "block"
            : "hidden md:block"
        )}
      >
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Lessons ({lessons.length})
          </h3>
        </div>
        <ul className="divide-y">
          {lessons.map((lesson, index) => {
            const canAccess = hasPurchased || lesson.is_preview;
            const isActive = activeLesson?.id === lesson.id;

            return (
              <li key={lesson.id}>
                <button
                  onClick={() => canAccess && navigateToLesson(lesson)}
                  disabled={!canAccess}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : canAccess
                        ? "hover:bg-muted"
                        : "cursor-not-allowed opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="flex-1 truncate">{lesson.title}</span>
                  {lesson.is_preview && !hasPurchased && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5"
                    >
                      <Eye className="mr-0.5 h-2.5 w-2.5" />
                      Free
                    </Badge>
                  )}
                  {!canAccess && (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
