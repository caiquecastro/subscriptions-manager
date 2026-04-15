import { doc, getDoc, setDoc } from "firebase/firestore";
import type { Currency } from "./currency";
import { db } from "./firebase-app";

export interface ExchangeRates {
  base: "USD";
  rates: Record<string, number>;
  updatedAt: string;
}

const CACHE_DOC = "exchangeRates/latest";
const STALE_MS = 24 * 60 * 60 * 1000; // 24 hours

async function fetchRatesFromApi(): Promise<Record<string, number>> {
  const res = await fetch(
    "https://api.exchangerate.host/latest?base=USD&symbols=BRL,EUR"
  );
  if (!res.ok) throw new Error("Failed to fetch exchange rates");
  const data = await res.json();
  return { USD: 1, ...data.rates };
}

export async function getExchangeRates(): Promise<ExchangeRates> {
  const ref = doc(db, CACHE_DOC);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    const cached = snapshot.data() as ExchangeRates;
    const age = Date.now() - new Date(cached.updatedAt).getTime();
    if (age < STALE_MS) return cached;
  }

  const rates = await fetchRatesFromApi();
  const fresh: ExchangeRates = {
    base: "USD",
    rates,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(ref, fresh);
  return fresh;
}

export function convert(
  amount: number,
  from: Currency,
  to: Currency,
  rates: ExchangeRates
): number {
  if (from === to) return amount;
  const fromRate = rates.rates[from] ?? 1;
  const toRate = rates.rates[to] ?? 1;
  return (amount / fromRate) * toRate;
}
