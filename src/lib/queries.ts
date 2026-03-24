import { createServerClient } from "@/lib/supabase";
import type { Course, Lesson, Purchase } from "@/types/models";

// ── Courses ──────────────────────────────────────────────

export async function getPublishedCourses(): Promise<Course[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch courses: ${error.message}`);
  return data ?? [];
}

export async function getCourseById(id: string): Promise<Course | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch course: ${error.message}`);
  }
  return data ?? null;
}

export async function getAllCourses(): Promise<Course[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch courses: ${error.message}`);
  return data ?? [];
}

export async function createCourse(
  course: Omit<Course, "id" | "created_at">
): Promise<Course> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("courses")
    .insert(course)
    .select()
    .single();

  if (error) throw new Error(`Failed to create course: ${error.message}`);
  return data;
}

export async function updateCourse(
  id: string,
  updates: Partial<Omit<Course, "id" | "created_at">>
): Promise<Course> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update course: ${error.message}`);
  return data;
}

export async function deleteCourse(id: string): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);

  if (error) throw new Error(`Failed to delete course: ${error.message}`);
}

// ── Lessons ──────────────────────────────────────────────

export async function getLessonsByCourseId(
  courseId: string
): Promise<Lesson[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("position", { ascending: true });

  if (error) throw new Error(`Failed to fetch lessons: ${error.message}`);
  return data ?? [];
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch lesson: ${error.message}`);
  }
  return data ?? null;
}

export async function createLesson(
  lesson: Omit<Lesson, "id">
): Promise<Lesson> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("lessons")
    .insert(lesson)
    .select()
    .single();

  if (error) throw new Error(`Failed to create lesson: ${error.message}`);
  return data;
}

export async function updateLesson(
  id: string,
  updates: Partial<Omit<Lesson, "id">>
): Promise<Lesson> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("lessons")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update lesson: ${error.message}`);
  return data;
}

export async function deleteLesson(id: string): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from("lessons").delete().eq("id", id);

  if (error) throw new Error(`Failed to delete lesson: ${error.message}`);
}

export async function reorderLessons(
  lessons: { id: string; position: number }[]
): Promise<void> {
  const supabase = createServerClient();
  for (const lesson of lessons) {
    const { error } = await supabase
      .from("lessons")
      .update({ position: lesson.position })
      .eq("id", lesson.id);

    if (error)
      throw new Error(`Failed to reorder lesson ${lesson.id}: ${error.message}`);
  }
}

// ── Purchases ────────────────────────────────────────────

export async function getUserPurchases(userId: string): Promise<Purchase[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch purchases: ${error.message}`);
  return data ?? [];
}

export async function getUserPurchaseForCourse(
  userId: string,
  courseId: string
): Promise<Purchase | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch purchase: ${error.message}`);
  }
  return data ?? null;
}

export async function createPurchase(
  purchase: Omit<Purchase, "id" | "created_at">
): Promise<Purchase> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("purchases")
    .insert(purchase)
    .select()
    .single();

  if (error) throw new Error(`Failed to create purchase: ${error.message}`);
  return data;
}

export async function getAllPurchases(): Promise<
  (Purchase & { course_title?: string })[]
> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("*, courses(title)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch purchases: ${error.message}`);
  return (data ?? []).map((p: Record<string, unknown>) => ({
    ...p,
    course_title: (p.courses as { title: string } | null)?.title,
  })) as (Purchase & { course_title?: string })[];
}

export async function getPurchaseStats(): Promise<{
  totalRevenue: number;
  totalPurchases: number;
  thisMonthRevenue: number;
  thisWeekRevenue: number;
}> {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("purchases").select("amount, created_at");

  if (error) throw new Error(`Failed to fetch stats: ${error.message}`);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const purchases = data ?? [];
  const totalRevenue = purchases.reduce(
    (sum: number, p: { amount: number }) => sum + p.amount,
    0
  );
  const thisMonthRevenue = purchases
    .filter((p: { created_at: string }) => new Date(p.created_at) >= startOfMonth)
    .reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
  const thisWeekRevenue = purchases
    .filter((p: { created_at: string }) => new Date(p.created_at) >= startOfWeek)
    .reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);

  return {
    totalRevenue,
    totalPurchases: purchases.length,
    thisMonthRevenue,
    thisWeekRevenue,
  };
}
