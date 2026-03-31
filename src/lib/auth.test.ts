import { describe, expect, it } from "vitest";
import { normalizeEmail } from "./auth";

describe("normalizeEmail", () => {
  it("normalizes casing and whitespace", () => {
    expect(normalizeEmail("  USER@Example.com ")).toBe("user@example.com");
  });

  it("returns null for empty values", () => {
    expect(normalizeEmail("")).toBe(null);
    expect(normalizeEmail(null)).toBe(null);
    expect(normalizeEmail(undefined)).toBe(null);
  });
});
