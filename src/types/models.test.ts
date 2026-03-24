import { describe, it, expect } from "vitest";
import type { Course, Lesson, Purchase } from "@/types/models";

describe("Model Types", () => {
  it("should define a Course with required fields", () => {
    const course: Course = {
      id: "course-1",
      title: "Learn TypeScript",
      description: "A comprehensive guide to TypeScript",
      price: 4999, // cents
      thumbnail_url: "https://example.com/thumb.jpg",
      published: true,
      created_at: "2026-01-01T00:00:00Z",
    };

    expect(course.id).toBe("course-1");
    expect(course.price).toBe(4999);
    expect(course.published).toBe(true);
  });

  it("should define a Lesson with Cloudflare Stream video_uid", () => {
    const lesson: Lesson = {
      id: "lesson-1",
      course_id: "course-1",
      title: "Introduction",
      description: "Getting started with TypeScript",
      video_uid: "cf-stream-uid-abc123",
      position: 1,
      is_preview: true,
    };

    expect(lesson.video_uid).toBe("cf-stream-uid-abc123");
    expect(lesson.is_preview).toBe(true);
    expect(lesson.position).toBe(1);
  });

  it("should define a Purchase linking user to course", () => {
    const purchase: Purchase = {
      id: "purchase-1",
      user_id: "user-clerk-123",
      course_id: "course-1",
      stripe_payment_id: "pi_abc123",
      amount: 4999,
      created_at: "2026-03-24T00:00:00Z",
    };

    expect(purchase.user_id).toBe("user-clerk-123");
    expect(purchase.stripe_payment_id).toBe("pi_abc123");
    expect(purchase.amount).toBe(4999);
  });

  it("should allow optional fields on Course", () => {
    const course: Course = {
      id: "course-2",
      title: "Minimal Course",
      description: "Short",
      price: 0,
      thumbnail_url: null,
      published: false,
      created_at: "2026-01-01T00:00:00Z",
    };

    expect(course.thumbnail_url).toBeNull();
    expect(course.price).toBe(0);
  });

  it("should allow optional description on Lesson", () => {
    const lesson: Lesson = {
      id: "lesson-2",
      course_id: "course-1",
      title: "Bonus",
      description: null,
      video_uid: "cf-stream-uid-xyz",
      position: 2,
      is_preview: false,
    };

    expect(lesson.description).toBeNull();
  });
});
