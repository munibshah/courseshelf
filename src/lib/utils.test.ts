import { describe, it, expect } from "vitest";
import { formatPrice, formatDate, slugify } from "@/lib/utils";

describe("Utility Functions", () => {
  describe("formatPrice", () => {
    it("should format cents to dollar string", () => {
      expect(formatPrice(4999)).toBe("$49.99");
    });

    it("should format zero as free", () => {
      expect(formatPrice(0)).toBe("Free");
    });

    it("should format whole dollar amounts", () => {
      expect(formatPrice(1000)).toBe("$10.00");
    });

    it("should handle single digit cents", () => {
      expect(formatPrice(1205)).toBe("$12.05");
    });
  });

  describe("formatDate", () => {
    it("should format ISO date to readable string", () => {
      const result = formatDate("2026-03-24T00:00:00Z");
      expect(result).toContain("Mar");
      expect(result).toContain("2026");
    });
  });

  describe("slugify", () => {
    it("should convert title to URL slug", () => {
      expect(slugify("Learn TypeScript")).toBe("learn-typescript");
    });

    it("should handle special characters", () => {
      expect(slugify("React & Next.js: The Complete Guide!")).toBe(
        "react-nextjs-the-complete-guide"
      );
    });

    it("should trim leading/trailing hyphens", () => {
      expect(slugify("  Hello World  ")).toBe("hello-world");
    });
  });
});
