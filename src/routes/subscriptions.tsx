import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getSubscriptions, type Subscription } from '../lib/firebase'

export const Route = createFileRoute('/subscriptions')({ component: Subscriptions })

const categories = ['All', 'Entertainment', 'Productivity', 'Infrastructure', 'Professional', 'Health', 'Utilities', 'Development', 'Design', 'Cloud Storage']

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState<'renewal' | 'price' | 'name'>('renewal')

  useEffect(() => {
    getSubscriptions().then(setSubscriptions)
  }, [])

  const filtered = subscriptions
    .filter(s => activeCategory === 'All' || s.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === 'renewal') return new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime()
      if (sortBy === 'price') return b.cost - a.cost
      return a.name.localeCompare(b.name)
    })

  const totalMonthly = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      if (s.billingCycle === 'yearly') return sum + s.cost / 12
      if (s.billingCycle === 'quarterly') return sum + s.cost / 3
      return sum + s.cost
    }, 0)

  const urgentRenewals = subscriptions.filter(s => {
    const days = Math.ceil((new Date(s.nextRenewal).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days <= 3 && days >= 0
  })

  const highestCost = [...subscriptions].sort((a, b) => b.cost - a.cost)[0]
  const highestPercent = highestCost ? Math.round((highestCost.cost / totalMonthly) * 100) : 0

  return (
    <div className="rise-in space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">My Subscriptions</h1>
          <p className="text-sm text-on-surface-variant">
            {subscriptions.filter(s => s.status === 'active').length} active &middot; ${totalMonthly.toFixed(2)}/mo total
          </p>
        </div>
        <Link
          to="/add"
          className="signature-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-on-primary shadow-lg transition-transform hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Subscription
        </Link>
      </div>

      {/* Alerts */}
      {urgentRenewals.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl bg-error-container/30 p-4">
          <span className="material-symbols-outlined text-[20px] text-error">warning</span>
          <div>
            <p className="text-sm font-semibold text-on-error-container">Urgent Renewal</p>
            <p className="text-xs text-on-surface-variant">
              {urgentRenewals[0].name} renews within 48 hours — ${urgentRenewals[0].cost.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {highestCost && highestPercent > 30 && (
        <div className="flex items-start gap-3 rounded-xl bg-tertiary-container/10 p-4">
          <span className="material-symbols-outlined text-[20px] text-tertiary">insights</span>
          <div>
            <p className="text-sm font-semibold text-on-tertiary-container">High-Cost Alert</p>
            <p className="text-xs text-on-surface-variant">
              {highestCost.name} is {highestPercent}% of your monthly spend (${highestCost.cost.toFixed(2)}/mo)
            </p>
          </div>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant">Sort by:</span>
          {(['renewal', 'price', 'name'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                sortBy === s ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Subscription Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map(sub => {
          const daysUntil = Math.ceil((new Date(sub.nextRenewal).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          return (
            <div key={sub.id} className="group rounded-xl bg-surface-container-lowest p-5 ambient-shadow transition-transform hover:scale-[1.01]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/8">
                    <span className="material-symbols-outlined text-[22px] text-primary">{sub.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{sub.name}</p>
                    <p className="text-xs text-on-surface-variant">{sub.category}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-container-high">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">edit</span>
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-error-container/30">
                    <span className="material-symbols-outlined text-[16px] text-error">cancel</span>
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="font-headline text-2xl font-bold text-on-surface">${sub.cost.toFixed(2)}</p>
                  <p className="text-xs text-on-surface-variant">
                    /{sub.billingCycle === 'monthly' ? 'month' : sub.billingCycle === 'yearly' ? 'year' : 'quarter'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    daysUntil <= 3
                      ? 'bg-error-container/30 text-error'
                      : daysUntil <= 7
                        ? 'bg-tertiary-container/20 text-tertiary'
                        : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {daysUntil <= 0 ? 'Due today' : `${daysUntil}d until renewal`}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
