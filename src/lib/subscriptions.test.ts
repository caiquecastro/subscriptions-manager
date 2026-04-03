import { describe, expect, it } from "vitest";
import { getMonthlySubscriptionCost } from "./subscriptions";

describe("getMonthlySubscriptionCost", () => {
  it("keeps monthly subscriptions unchanged", () => {
    const subscription = { billingCycle: "monthly", cost: 24 } as const;
    expect(getMonthlySubscriptionCost(subscription)).toBe(24);
  });

  it("divides yearly subscriptions by 12", () => {
    const subscription = { billingCycle: "yearly", cost: 120 } as const;
    expect(getMonthlySubscriptionCost(subscription)).toBe(10);
  });

  it("divides quarterly subscriptions by 3", () => {
    const subscription = { billingCycle: "quarterly", cost: 90 } as const;
    expect(getMonthlySubscriptionCost(subscription)).toBe(30);
  });
});
