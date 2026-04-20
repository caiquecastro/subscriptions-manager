import { describe, expect, it } from "vitest";
import { suggestService } from "./servicesSuggestion";

describe("suggestService", () => {
  it("returns null for empty input", () => {
    expect(suggestService("")).toBeNull();
    expect(suggestService("   ")).toBeNull();
  });

  it("returns null for exact match", () => {
    expect(suggestService("Netflix")).toBeNull();
    expect(suggestService("YouTube Premium")).toBeNull();
    expect(suggestService("Spotify")).toBeNull();
  });

  it("suggests on simple typo", () => {
    expect(suggestService("Netflx")).toBe("Netflix");
    expect(suggestService("Spotfy")).toBe("Spotify");
    expect(suggestService("Diopbox")).toBe("Dropbox");
  });

  it("suggests when user types partial name with typo", () => {
    expect(suggestService("Yotoube")).toBe("YouTube Premium");
    expect(suggestService("Yutube")).toBe("YouTube Premium");
    expect(suggestService("Linekdin")).toBe("LinkedIn Premium");
  });

  it("suggests when user types exact partial name", () => {
    expect(suggestService("YouTube")).toBe("YouTube Premium");
    expect(suggestService("LinkedIn")).toBe("LinkedIn Premium");
    expect(suggestService("Microsoft")).toBe("Microsoft 365");
  });

  it("returns null for unrecognized input far from any service", () => {
    expect(suggestService("xxxxxxxxxx")).toBeNull();
    expect(suggestService("randomservice")).toBeNull();
  });
});
