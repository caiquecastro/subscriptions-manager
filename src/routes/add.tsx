import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BALANCE_TYPES } from "../components/BalanceCard";
import { SubscriptionForm, type SubscriptionFormValues } from "../components/SubscriptionForm";
import { cn } from "../lib/cn";
import { addBalance, addSubscription } from "../lib/firebase";
import { balancesQueryOptions, subscriptionsQueryOptions } from "../lib/query";

export const Route = createFileRoute("/add")({
  component: AddEntry,
  validateSearch: (
    search: Record<string, unknown>
  ): { type?: "subscription" | "balance" } => ({
    type:
      search.type === "balance" || search.type === "subscription"
        ? search.type
        : undefined,
  }),
});

const DEFAULT_SUBSCRIPTION_VALUES: SubscriptionFormValues = {
  name: "",
  cost: "",
  currency: "BRL",
  category: "",
  billingCycle: "monthly",
  nextRenewal: new Date().toISOString().split("T")[0],
  status: "active",
  notes: "",
};

function AddEntry() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { type } = Route.useSearch();
  const [entryType, setEntryType] = useState<"subscription" | "balance">(
    type ?? "subscription"
  );

  // Balance-only state
  const [balanceName, setBalanceName] = useState("");
  const [balanceCost, setBalanceCost] = useState("");
  const [balanceType, setBalanceType] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [balanceNotes, setBalanceNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [subError, setSubError] = useState("");

  const handleSubscriptionSubmit = async (values: SubscriptionFormValues) => {
    setSubError("");
    try {
      await addSubscription({
        name: values.name,
        category: values.category || "Other",
        cost: parseFloat(values.cost),
        currency: values.currency,
        billingCycle: values.billingCycle,
        nextRenewal:
          values.nextRenewal || new Date().toISOString().split("T")[0],
        status: "active",
        icon: "subscriptions",
        notes: values.notes || undefined,
      });
      await queryClient.invalidateQueries({
        queryKey: subscriptionsQueryOptions.queryKey,
      });
      navigate({ to: "/subscriptions" });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to save. Check your connection and try again.";
      setSubError(msg);
      throw err;
    }
  };

  const handleBalanceSave = async () => {
    if (!balanceName || !balanceCost) return;
    setSaving(true);
    setError("");
    try {
      await addBalance({
        name: balanceName,
        type: balanceType || "Store Credit",
        amount: parseFloat(balanceCost),
        icon: "account_balance_wallet",
        expiresAt: expiresAt || undefined,
        notes: balanceNotes,
      });
      await queryClient.invalidateQueries({
        queryKey: balancesQueryOptions.queryKey,
      });
      navigate({ to: "/balances" });
    } catch (err) {
      setSaving(false);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save. Check your connection and try again."
      );
    }
  };

  return (
    <div className="rise-in mx-auto max-w-2xl space-y-6 py-4">
      {/* Header */}
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">
          Update Your Portfolio
        </h1>
        <p className="text-sm text-on-surface-variant">
          Keep your financial ecosystem precise and up to date.
        </p>
      </div>

      {/* Entry Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setEntryType("subscription")}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl p-6 transition-all",
            entryType === "subscription"
              ? "bg-primary/10 ring-2 ring-primary"
              : "bg-surface-container-lowest ambient-shadow hover:bg-surface-container-low"
          )}
        >
          <span
            className={cn(
              "material-symbols-outlined text-[28px]",
              entryType === "subscription"
                ? "text-primary"
                : "text-on-surface-variant"
            )}
          >
            card_membership
          </span>
          <span
            className={cn(
              "text-sm font-semibold",
              entryType === "subscription" ? "text-primary" : "text-on-surface"
            )}
          >
            Subscription
          </span>
        </button>
        <button
          type="button"
          onClick={() => setEntryType("balance")}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl p-6 transition-all",
            entryType === "balance"
              ? "bg-primary/10 ring-2 ring-primary"
              : "bg-surface-container-lowest ambient-shadow hover:bg-surface-container-low"
          )}
        >
          <span
            className={cn(
              "material-symbols-outlined text-[28px]",
              entryType === "balance"
                ? "text-primary"
                : "text-on-surface-variant"
            )}
          >
            account_balance
          </span>
          <span
            className={cn(
              "text-sm font-semibold",
              entryType === "balance" ? "text-primary" : "text-on-surface"
            )}
          >
            Balance
          </span>
        </button>
      </div>

      {entryType === "subscription" ? (
        <div className="space-y-5 rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
          <SubscriptionForm
            defaultValues={DEFAULT_SUBSCRIPTION_VALUES}
            onSubmit={handleSubscriptionSubmit}
            onCancel={() => navigate({ to: "/" })}
            submitLabel="Save Subscription"
            cancelLabel="Discard Draft"
            error={subError}
          />
        </div>
      ) : (
        <>
          {/* Balance Form */}
          <div className="space-y-5 rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
            {/* Account Name */}
            <div>
              <label
                htmlFor="entry-name"
                className="mb-1.5 block text-sm font-medium text-on-surface"
              >
                Account Name
              </label>
              <input
                id="entry-name"
                type="text"
                value={balanceName}
                onChange={(e) => setBalanceName(e.target.value)}
                placeholder="e.g., Apple ID, Amazon..."
                className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Current Balance */}
            <div>
              <label
                htmlFor="entry-cost"
                className="mb-1.5 block text-sm font-medium text-on-surface"
              >
                Current Balance
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                  $
                </span>
                <input
                  id="entry-cost"
                  type="number"
                  value={balanceCost}
                  onChange={(e) => setBalanceCost(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full rounded-lg bg-surface-variant py-3 pl-8 pr-4 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Balance Type */}
            <div>
              <label
                htmlFor="entry-balance-type"
                className="mb-1.5 block text-sm font-medium text-on-surface"
              >
                Balance Type
              </label>
              <select
                id="entry-balance-type"
                value={balanceType}
                onChange={(e) => setBalanceType(e.target.value)}
                className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select type...</option>
                {BALANCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Expiration Date */}
            <div>
              <label
                htmlFor="entry-expires"
                className="mb-1.5 block text-sm font-medium text-on-surface"
              >
                Expiration Date (optional)
              </label>
              <input
                id="entry-expires"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="entry-notes"
                className="mb-1.5 block text-sm font-medium text-on-surface"
              >
                Notes (optional)
              </label>
              <textarea
                id="entry-notes"
                value={balanceNotes}
                onChange={(e) => setBalanceNotes(e.target.value)}
                placeholder="Add any notes about this entry..."
                rows={3}
                className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-error-container/30 p-4">
              <span className="material-symbols-outlined text-[20px] text-error">
                error
              </span>
              <p className="text-sm text-on-error-container">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high"
            >
              Discard Draft
            </button>
            <button
              type="button"
              onClick={handleBalanceSave}
              disabled={!balanceName || !balanceCost || saving}
              className="signature-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-on-primary shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving ? "Saving..." : "Save Balance"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
