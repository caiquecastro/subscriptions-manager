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
    const subscription = { nextRenewal: "2026-04-03T12:00:00.000Z" };
    expect(getDaysUntilRenewal(subscription, now)).toBe(3);
  });

  it("identifies renewals inside the inclusive alert window", () => {
    const subscription1 = { nextRenewal: "2026-03-31T15:00:00.000Z" };
    expect(isRenewalWithinDays(subscription1, 3, now)).toBe(true);

    const subscription2 = { nextRenewal: "2026-04-03T12:00:00.000Z" };
    expect(isRenewalWithinDays(subscription2, 3, now)).toBe(true);
  });

  it("excludes past renewals and renewals outside the alert window", () => {
    const subscription1 = { nextRenewal: "2026-03-30T12:00:00.000Z" };
    expect(isRenewalWithinDays(subscription1, 3, now)).toBe(false);

    const subscription2 = { nextRenewal: "2026-04-04T12:00:00.000Z" };
    expect(isRenewalWithinDays(subscription2, 3, now)).toBe(false);
  });
});
