import type { Subscription } from './firebase'

export function getMonthlySubscriptionCost(subscription: Pick<Subscription, 'cost' | 'billingCycle'>) {
  if (subscription.billingCycle === 'yearly') return subscription.cost / 12
  if (subscription.billingCycle === 'quarterly') return subscription.cost / 3
  return subscription.cost
}
