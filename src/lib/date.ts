import type { Subscription } from "./firebase";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Parses a date string as a local date when it's a bare "YYYY-MM-DD" value.
// `new Date("2026-04-05")` is interpreted as UTC midnight, which renders as
// the previous day in negative-offset timezones — for fields that only carry
// a calendar date (renewals, invoice dates, expirations) we want the local
// day instead.
export function parseLocalDate(value: string): Date {
  if (DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

// "Apr 5" — compact label for near-term events like upcoming renewals.
export function formatShortMonthDay(value: string): string {
  return parseLocalDate(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// "Apr 5, 2026" — compact label with year for longer-horizon events.
export function formatShortMonthDayYear(value: string): string {
  return parseLocalDate(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// "05 de abr. de 2026" — pt-BR abbreviated date for invoice records.
export function formatInvoiceDate(value: string): string {
  return parseLocalDate(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// "05 de abril de 2026" — pt-BR long date for invoice detail headings.
export function formatInvoiceDateLong(value: string): string {
  return parseLocalDate(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function getDaysUntilDate(date: string, now = new Date()) {
  return Math.ceil((new Date(date).getTime() - now.getTime()) / MS_PER_DAY);
}

export function compareDateStrings(a: string, b: string) {
  return new Date(a).getTime() - new Date(b).getTime();
}

export function getDaysUntilRenewal(
  subscription: Pick<Subscription, "nextRenewal">,
  now = new Date()
) {
  return getDaysUntilDate(subscription.nextRenewal, now);
}

export function isRenewalWithinDays(
  subscription: Pick<Subscription, "nextRenewal">,
  days: number,
  now = new Date()
) {
  const daysUntilRenewal = getDaysUntilRenewal(subscription, now);
  return daysUntilRenewal >= 0 && daysUntilRenewal <= days;
}
