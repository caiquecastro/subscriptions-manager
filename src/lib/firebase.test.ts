import { describe, expect, it } from "vitest";
import { getUserCollectionPath } from "./firebase";

describe("getUserCollectionPath", () => {
  it("builds the user-scoped subscriptions path", () => {
    expect(getUserCollectionPath("user_123", "subscriptions")).toBe(
      "users/user_123/subscriptions",
    );
  });

  it("builds the user-scoped balances path", () => {
    expect(getUserCollectionPath("user_123", "balances")).toBe(
      "users/user_123/balances",
    );
  });
});
