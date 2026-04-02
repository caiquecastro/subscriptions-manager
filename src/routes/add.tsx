import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { addSubscription, addBalance } from '../lib/firebase'
import { BALANCE_TYPES } from '../components/BalanceCard'
import { balancesQueryOptions, subscriptionsQueryOptions } from '../lib/query'

export const Route = createFileRoute('/add')({
  component: AddEntry,
  validateSearch: (search: Record<string, unknown>): { type?: 'subscription' | 'balance' } => ({
    type: search.type === 'balance' || search.type === 'subscription' ? search.type : undefined,
  }),
})

const servicesSuggestions = ['Netflix', 'Spotify', 'AWS', 'Gym Membership', 'Adobe Creative Cloud', 'iCloud+', 'GitHub Pro', 'Figma', 'Notion']

function AddEntry() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { type } = Route.useSearch()
  const [entryType, setEntryType] = useState<'subscription' | 'balance'>(type ?? 'subscription')
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'quarterly'>('monthly')
  const [nextRenewal, setNextRenewal] = useState('')
  const [category, setCategory] = useState('')
  const [balanceType, setBalanceType] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [notes, setNotes] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const filteredSuggestions = servicesSuggestions.filter(s =>
    s.toLowerCase().includes(name.toLowerCase()) && name.length > 0
  )

  const handleSave = async () => {
    if (!name || !cost) return
    setSaving(true)
    setError('')
    try {
      if (entryType === 'subscription') {
        await addSubscription({
          name,
          category: category || 'Other',
          cost: parseFloat(cost),
          billingCycle,
          nextRenewal: nextRenewal || new Date().toISOString().split('T')[0],
          status: 'active',
          icon: 'subscriptions',
          notes,
        })
        await queryClient.invalidateQueries({ queryKey: subscriptionsQueryOptions.queryKey })
      } else {
        await addBalance({
          name,
          type: balanceType || 'Store Credit',
          amount: parseFloat(cost),
          icon: 'account_balance_wallet',
          expiresAt: expiresAt || undefined,
          notes,
        })
        await queryClient.invalidateQueries({ queryKey: balancesQueryOptions.queryKey })
      }
      navigate({ to: entryType === 'subscription' ? '/subscriptions' : '/balances' })
    } catch (err) {
      setSaving(false)
      setError(err instanceof Error ? err.message : 'Failed to save. Check your connection and try again.')
    }
  }

  return (
    <div className="rise-in mx-auto max-w-2xl space-y-6 py-4">
      {/* Header */}
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Update Your Portfolio</h1>
        <p className="text-sm text-on-surface-variant">Keep your financial ecosystem precise and up to date.</p>
      </div>

      {/* Entry Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setEntryType('subscription')}
          className={`flex flex-col items-center gap-3 rounded-xl p-6 transition-all ${
            entryType === 'subscription'
              ? 'bg-primary/10 ring-2 ring-primary'
              : 'bg-surface-container-lowest ambient-shadow hover:bg-surface-container-low'
          }`}
        >
          <span className={`material-symbols-outlined text-[28px] ${entryType === 'subscription' ? 'text-primary' : 'text-on-surface-variant'}`}>
            card_membership
          </span>
          <span className={`text-sm font-semibold ${entryType === 'subscription' ? 'text-primary' : 'text-on-surface'}`}>
            Subscription
          </span>
        </button>
        <button
          onClick={() => setEntryType('balance')}
          className={`flex flex-col items-center gap-3 rounded-xl p-6 transition-all ${
            entryType === 'balance'
              ? 'bg-primary/10 ring-2 ring-primary'
              : 'bg-surface-container-lowest ambient-shadow hover:bg-surface-container-low'
          }`}
        >
          <span className={`material-symbols-outlined text-[28px] ${entryType === 'balance' ? 'text-primary' : 'text-on-surface-variant'}`}>
            account_balance
          </span>
          <span className={`text-sm font-semibold ${entryType === 'balance' ? 'text-primary' : 'text-on-surface'}`}>
            Balance
          </span>
        </button>
      </div>

      {/* Form */}
      <div className="space-y-5 rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
        {/* Service Name */}
        <div className="relative">
          <label className="mb-1.5 block text-sm font-medium text-on-surface">
            {entryType === 'subscription' ? 'Service Name' : 'Account Name'}
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setShowSuggestions(true) }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={entryType === 'subscription' ? 'e.g., Netflix, Spotify...' : 'e.g., Apple ID, Amazon...'}
            className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
          />
          {showSuggestions && filteredSuggestions.length > 0 && entryType === 'subscription' && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg bg-surface-container-lowest p-1 shadow-lg">
              {filteredSuggestions.map(s => (
                <button
                  key={s}
                  onMouseDown={() => { setName(s); setShowSuggestions(false) }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">subscriptions</span>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cost */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-on-surface">
            {entryType === 'subscription' ? 'Monthly Cost' : 'Current Balance'}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">$</span>
            <input
              type="number"
              value={cost}
              onChange={e => setCost(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full rounded-lg bg-surface-variant py-3 pl-8 pr-4 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {entryType === 'subscription' ? (
          <>
            {/* Category */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select category...</option>
                <option>Entertainment</option>
                <option>Productivity</option>
                <option>Infrastructure</option>
                <option>Professional</option>
                <option>Health</option>
                <option>Utilities</option>
                <option>Development</option>
                <option>Design</option>
                <option>Cloud Storage</option>
                <option>Other</option>
              </select>
            </div>

            {/* Billing Cycle */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">Billing Cycle</label>
              <div className="flex gap-2">
                {(['monthly', 'yearly', 'quarterly'] as const).map(cycle => (
                  <button
                    key={cycle}
                    onClick={() => setBillingCycle(cycle)}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                      billingCycle === cycle
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Renewal Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">Next Renewal Date</label>
              <input
                type="date"
                value={nextRenewal}
                onChange={e => setNextRenewal(e.target.value)}
                className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </>
        ) : (
          <>
            {/* Balance Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">Balance Type</label>
              <select
                value={balanceType}
                onChange={e => setBalanceType(e.target.value)}
                className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select type...</option>
                {BALANCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Expiration Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface">Expiration Date (optional)</label>
              <input
                type="date"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </>
        )}

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-on-surface">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add any notes about this entry..."
            rows={3}
            className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-error-container/30 p-4">
          <span className="material-symbols-outlined text-[20px] text-error">error</span>
          <p className="text-sm text-on-error-container">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate({ to: '/' })}
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high"
        >
          Discard Draft
        </button>
        <button
          onClick={handleSave}
          disabled={!name || !cost || saving}
          className="signature-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-on-primary shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        >
          {saving ? 'Saving...' : entryType === 'subscription' ? 'Save Subscription' : 'Save Balance'}
        </button>
      </div>
    </div>
  )
}
