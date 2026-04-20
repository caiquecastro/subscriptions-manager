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

  it("suggests name and category on simple typo", () => {
    expect(suggestService("Netflx")).toEqual({ name: "Netflix", category: "Entertainment" });
    expect(suggestService("Spotfy")).toEqual({ name: "Spotify", category: "Entertainment" });
    expect(suggestService("Diopbox")).toEqual({ name: "Dropbox", category: "Cloud Storage" });
  });

  it("suggests when user types partial name with typo", () => {
    expect(suggestService("Yotoube")).toEqual({ name: "YouTube Premium", category: "Entertainment" });
    expect(suggestService("Yutube")).toEqual({ name: "YouTube Premium", category: "Entertainment" });
    expect(suggestService("Linekdin")).toEqual({ name: "LinkedIn Premium", category: "Professional" });
  });

  it("suggests when user types exact partial name", () => {
    expect(suggestService("YouTube")).toEqual({ name: "YouTube Premium", category: "Entertainment" });
    expect(suggestService("LinkedIn")).toEqual({ name: "LinkedIn Premium", category: "Professional" });
    expect(suggestService("Microsoft")).toEqual({ name: "Microsoft 365", category: "Productivity" });
  });

  it("returns null for unrecognized input far from any service", () => {
    expect(suggestService("xxxxxxxxxx")).toBeNull();
    expect(suggestService("randomservice")).toBeNull();
  });
});
