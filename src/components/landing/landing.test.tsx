import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "@/components/landing/hero-section";
import { CourseCard } from "@/components/landing/course-card";
import type { Course } from "@/types/models";

describe("Landing Page Components", () => {
  describe("HeroSection", () => {
    it("should render the main headline", () => {
      render(<HeroSection />);
      expect(
        screen.getByText(/learn from the best/i)
      ).toBeInTheDocument();
    });

    it("should render a CTA button", () => {
      render(<HeroSection />);
      expect(
        screen.getByRole("link", { name: /browse courses/i })
      ).toBeInTheDocument();
    });
  });

  describe("CourseCard", () => {
    const mockCourse: Course = {
      id: "course-1",
      title: "Master TypeScript",
      description: "A complete guide to TypeScript for professionals",
      price: 4999,
      thumbnail_url: "https://example.com/thumb.jpg",
      published: true,
      created_at: "2026-01-15T00:00:00Z",
    };

    it("should render course title", () => {
      render(<CourseCard course={mockCourse} />);
      expect(screen.getByText("Master TypeScript")).toBeInTheDocument();
    });

    it("should render course description", () => {
      render(<CourseCard course={mockCourse} />);
      expect(
        screen.getByText(/complete guide to typescript/i)
      ).toBeInTheDocument();
    });

    it("should render formatted price", () => {
      render(<CourseCard course={mockCourse} />);
      expect(screen.getByText("$49.99")).toBeInTheDocument();
    });

    it("should render Free for zero price", () => {
      render(<CourseCard course={{ ...mockCourse, price: 0 }} />);
      expect(screen.getByText("Free")).toBeInTheDocument();
    });

    it("should link to the course detail page", () => {
      render(<CourseCard course={mockCourse} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/courses/course-1");
    });
  });
});
