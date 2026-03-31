import type { Subscription } from "./firebase";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function getDaysUntilDate(date: string, now = new Date()) {
  return Math.ceil((new Date(date).getTime() - now.getTime()) / MS_PER_DAY);
}

export function compareDateStrings(a: string, b: string) {
  return new Date(a).getTime() - new Date(b).getTime();
}

export function getDaysUntilRenewal(
  subscription: Pick<Subscription, "nextRenewal">,
  now = new Date(),
) {
  return getDaysUntilDate(subscription.nextRenewal, now);
}

export function isRenewalWithinDays(
  subscription: Pick<Subscription, "nextRenewal">,
  days: number,
  now = new Date(),
) {
  const daysUntilRenewal = getDaysUntilRenewal(subscription, now);
  return daysUntilRenewal >= 0 && daysUntilRenewal <= days;
}
