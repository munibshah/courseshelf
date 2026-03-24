"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Trash2,
  Plus,
  GripVertical,
  Upload,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import type { Course, Lesson } from "@/types/models";
import Link from "next/link";

interface CourseEditorProps {
  courseId: string;
}

export default function CourseEditorPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setCourseId(p.courseId));
  }, [params]);

  if (!courseId) return null;
  return <CourseEditor courseId={courseId} />;
}

function CourseEditor({ courseId }: CourseEditorProps) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [published, setPublished] = useState(false);

  // New lesson form
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [addingLesson, setAddingLesson] = useState(false);

  // Video upload
  const [uploadingVideo, setUploadingVideo] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    const res = await fetch(`/api/admin/courses/${courseId}`);
    if (!res.ok) return router.push("/admin/courses");
    const data = await res.json();
    setCourse(data);
    setTitle(data.title);
    setDescription(data.description);
    setPrice((data.price / 100).toFixed(2));
    setPublished(data.published);
  }, [courseId, router]);

  const fetchLessons = useCallback(async () => {
    const res = await fetch(
      `/api/admin/courses/${courseId}/lessons`
    );
    if (res.ok) {
      const data = await res.json();
      setLessons(data);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
    fetchLessons();
  }, [fetchCourse, fetchLessons]);

  async function handleSaveCourse() {
    setSaving(true);
    try {
      await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: Math.round(parseFloat(price || "0") * 100),
          published,
        }),
      });
      await fetchCourse();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCourse() {
    if (!confirm("Delete this course and all its lessons?")) return;
    await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
    router.push("/admin/courses");
  }

  async function handleAddLesson() {
    if (!newLessonTitle.trim()) return;
    setAddingLesson(true);
    try {
      await fetch(`/api/admin/courses/${courseId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newLessonTitle,
          position: lessons.length,
        }),
      });
      setNewLessonTitle("");
      await fetchLessons();
    } finally {
      setAddingLesson(false);
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm("Delete this lesson?")) return;
    await fetch(
      `/api/admin/courses/${courseId}/lessons/${lessonId}`,
      { method: "DELETE" }
    );
    await fetchLessons();
  }

  async function handleTogglePreview(lesson: Lesson) {
    await fetch(
      `/api/admin/courses/${courseId}/lessons/${lesson.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_preview: !lesson.is_preview }),
      }
    );
    await fetchLessons();
  }

  async function handleVideoUpload(lessonId: string, file: File) {
    setUploadingVideo(lessonId);
    try {
      // 1. Get direct upload URL from our API
      const uploadRes = await fetch("/api/admin/upload/video", {
        method: "POST",
      });
      if (!uploadRes.ok) throw new Error("Failed to get upload URL");
      const { uid, uploadURL } = await uploadRes.json();

      // 2. Upload file directly to Cloudflare Stream
      const formData = new FormData();
      formData.append("file", file);
      await fetch(uploadURL, { method: "POST", body: formData });

      // 3. Update lesson with video UID
      await fetch(
        `/api/admin/courses/${courseId}/lessons/${lessonId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_uid: uid }),
        }
      );
      await fetchLessons();
    } finally {
      setUploadingVideo(null);
    }
  }

  async function handleThumbnailUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", courseId);

    const res = await fetch("/api/admin/upload/thumbnail", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const { url } = await res.json();
      await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thumbnail_url: url }),
      });
      await fetchCourse();
    }
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/courses"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Courses
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Edit Course</h1>
        <Badge variant={published ? "default" : "secondary"} className="ml-auto">
          {published ? "Published" : "Draft"}
        </Badge>
      </div>

      {/* Course Details */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Price (USD)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Thumbnail
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleThumbnailUpload(file);
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="published" className="text-sm font-medium">
              Published (visible to students)
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSaveCourse}
              disabled={saving}
              className={cn(buttonVariants())}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={handleDeleteCourse}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "text-destructive"
              )}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete Course
            </button>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Lessons */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Lessons</h2>
      </div>

      {lessons.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {index + 1}
                </span>
                <span className="flex-1 truncate text-sm font-medium">
                  {lesson.title}
                </span>
                {lesson.video_uid && (
                  <Badge variant="secondary" className="text-xs">
                    Video ✓
                  </Badge>
                )}
                <button
                  onClick={() => handleTogglePreview(lesson)}
                  title={
                    lesson.is_preview ? "Remove preview" : "Make preview"
                  }
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-8 w-8 p-0"
                  )}
                >
                  {lesson.is_preview ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
                <label
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-8 cursor-pointer px-2"
                  )}
                >
                  <Upload className="h-4 w-4" />
                  <span className="ml-1 text-xs">
                    {uploadingVideo === lesson.id
                      ? "Uploading…"
                      : "Video"}
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    disabled={uploadingVideo === lesson.id}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoUpload(lesson.id, file);
                    }}
                  />
                </label>
                <button
                  onClick={() => handleDeleteLesson(lesson.id)}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-8 w-8 p-0 text-destructive"
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Lesson */}
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Input
            placeholder="New lesson title…"
            value={newLessonTitle}
            onChange={(e) => setNewLessonTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddLesson();
            }}
          />
          <button
            onClick={handleAddLesson}
            disabled={addingLesson || !newLessonTitle.trim()}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <Plus className="mr-1 h-4 w-4" />
            {addingLesson ? "Adding…" : "Add"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
