import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { balancesQueryOptions } from '../lib/query'

export const Route = createFileRoute('/balances')({ component: Balances })

function Balances() {
  const [view, setView] = useState<'30d' | '90d'>('30d')
  const { data: balances = [] } = useQuery(balancesQueryOptions)

  const totalBalance = balances.reduce((sum, b) => {
    if (b.type === 'Reward Points') return sum
    return sum + b.amount
  }, 0)

  const totalPoints = balances
    .filter(b => b.type === 'Reward Points')
    .reduce((sum, b) => sum + b.amount, 0)

  const expiringSoon = balances.filter(b => {
    if (!b.expiresAt) return false
    const days = Math.ceil((new Date(b.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days <= 180
  })

  return (
    <div className="rise-in space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Account Balances</h1>
          <p className="text-sm text-on-surface-variant">
            {balances.length} accounts tracked
          </p>
        </div>
        <Link
          to="/add"
          className="signature-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-on-primary shadow-lg transition-transform hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Balance
        </Link>
      </div>

      {/* Total Balance Card */}
      <section className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
        <p className="text-sm font-medium text-on-surface-variant">Total Estimated Balance</p>
        <h2 className="font-headline mt-1 text-4xl font-bold tracking-tight text-on-surface lg:text-5xl">
          ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </h2>
        {totalPoints > 0 && (
          <p className="mt-2 text-sm text-on-surface-variant">
            + {totalPoints.toLocaleString()} reward points
          </p>
        )}

        {/* Balance Trend Chart Placeholder */}
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-on-surface-variant">Balance Trend</span>
            <div className="flex gap-1">
              {(['30d', '90d'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    view === v ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 flex h-32 items-end gap-1">
            {Array.from({ length: view === '30d' ? 30 : 90 }, (_, i) => {
              const height = 40 + Math.sin(i * 0.3) * 25 + Math.random() * 20
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-secondary/30 transition-all hover:bg-secondary/50"
                  style={{ height: `${Math.min(height, 100)}%` }}
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* Digital Balance Cards */}
      <section>
        <h2 className="font-headline mb-4 text-lg font-semibold text-on-surface">Digital Balances</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {balances.map(bal => (
            <div key={bal.id} className="group rounded-xl bg-surface-container-lowest p-5 ambient-shadow transition-transform hover:scale-[1.01]">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8">
                  <span className="material-symbols-outlined text-[20px] text-primary">{bal.icon}</span>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-surface-container-high group-hover:opacity-100">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">more_vert</span>
                </button>
              </div>
              <p className="mt-3 text-sm font-medium text-on-surface">{bal.name}</p>
              <p className="text-xs text-on-surface-variant">{bal.type}</p>
              <p className="font-headline mt-2 text-xl font-bold text-on-surface">
                {bal.type === 'Reward Points'
                  ? bal.amount.toLocaleString() + ' pts'
                  : '$' + bal.amount.toFixed(2)}
              </p>
              {bal.expiresAt && (
                <p className="mt-1.5 text-xs text-tertiary">
                  Expires {new Date(bal.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Expiring Alerts */}
      {expiringSoon.length > 0 && (
        <section className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-tertiary">schedule</span>
            <h2 className="font-headline text-lg font-semibold text-on-surface">Expiring Credits</h2>
          </div>
          <div className="mt-4 space-y-3">
            {expiringSoon.map(bal => {
              const days = Math.ceil((new Date(bal.expiresAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <div key={bal.id} className="flex items-center gap-4 rounded-lg bg-tertiary-container/10 p-4">
                  <span className="material-symbols-outlined text-[20px] text-tertiary">{bal.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">{bal.name}</p>
                    <p className="text-xs text-on-surface-variant">
                      {bal.type === 'Reward Points'
                        ? bal.amount.toLocaleString() + ' pts'
                        : '$' + bal.amount.toFixed(2)}
                      {' '}&middot; Expires in {days} days
                    </p>
                  </div>
                  <span className="rounded-full bg-tertiary-container/20 px-2.5 py-1 text-xs font-medium text-tertiary">
                    {days}d left
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
