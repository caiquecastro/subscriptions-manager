import { describe, expect, it } from 'vitest'
import { getMonthlySubscriptionCost } from './subscriptions'

describe('getMonthlySubscriptionCost', () => {
  it('keeps monthly subscriptions unchanged', () => {
    expect(getMonthlySubscriptionCost({ billingCycle: 'monthly', cost: 24 })).toBe(24)
  })

  it('divides yearly subscriptions by 12', () => {
    expect(getMonthlySubscriptionCost({ billingCycle: 'yearly', cost: 120 })).toBe(10)
  })

  it('divides quarterly subscriptions by 3', () => {
    expect(getMonthlySubscriptionCost({ billingCycle: 'quarterly', cost: 90 })).toBe(30)
  })
})
