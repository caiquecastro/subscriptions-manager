import { describe, expect, it } from "vitest";
import {
  compareDateStrings,
  getDaysUntilDate,
  getDaysUntilRenewal,
  isRenewalWithinDays,
} from "./date";

describe("date helpers", () => {
  const now = new Date("2026-03-31T12:00:00.000Z");

  it("calculates days until a date using the same rounding as the UI", () => {
    expect(getDaysUntilDate("2026-04-02T00:00:00.000Z", now)).toBe(2);
  });

  it("compares date strings in chronological order", () => {
    expect(compareDateStrings("2026-03-31", "2026-04-01")).toBeLessThan(0);
    expect(compareDateStrings("2026-04-01", "2026-03-31")).toBeGreaterThan(0);
    expect(compareDateStrings("2026-04-01", "2026-04-01")).toBe(0);
  });

  it("calculates days until renewal from a subscription", () => {
    expect(getDaysUntilRenewal({ nextRenewal: "2026-04-03T12:00:00.000Z" }, now)).toBe(3);
  });

  it("identifies renewals inside the inclusive alert window", () => {
    expect(isRenewalWithinDays({ nextRenewal: "2026-03-31T15:00:00.000Z" }, 3, now)).toBe(true);
    expect(isRenewalWithinDays({ nextRenewal: "2026-04-03T12:00:00.000Z" }, 3, now)).toBe(true);
  });

  it("excludes past renewals and renewals outside the alert window", () => {
    expect(isRenewalWithinDays({ nextRenewal: "2026-03-30T12:00:00.000Z" }, 3, now)).toBe(false);
    expect(isRenewalWithinDays({ nextRenewal: "2026-04-04T12:00:00.000Z" }, 3, now)).toBe(false);
  });
});
