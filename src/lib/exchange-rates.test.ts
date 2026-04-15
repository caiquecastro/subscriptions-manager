import { describe, expect, it } from "vitest";
import { convert } from "./exchange-rates";
import type { ExchangeRates } from "./exchange-rates";

const rates: ExchangeRates = {
  base: "USD",
  rates: { USD: 1, BRL: 5.0, EUR: 0.9 },
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("convert", () => {
  it("returns the same amount when currencies match", () => {
    expect(convert(100, "USD", "USD", rates)).toBe(100);
  });

  it("converts USD to BRL", () => {
    expect(convert(10, "USD", "BRL", rates)).toBe(50);
  });

  it("converts BRL to USD", () => {
    expect(convert(50, "BRL", "USD", rates)).toBe(10);
  });

  it("converts BRL to EUR", () => {
    expect(convert(50, "BRL", "EUR", rates)).toBeCloseTo(9);
  });

  it("converts EUR to BRL", () => {
    expect(convert(9, "EUR", "BRL", rates)).toBeCloseTo(50);
  });
});
