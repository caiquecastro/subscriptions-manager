import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { updateBalance } from "../lib/firebase";
import { balancesQueryOptions } from "../lib/query";

export const Route = createFileRoute("/balances")({ component: Balances });

function Balances() {
  const { data: balances = [] } = useQuery(balancesQueryOptions);
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editTypeValue, setEditTypeValue] = useState("");
  const [saving, setSaving] = useState(false);

  const balanceTypes = ["Store Credit", "Gift Card", "Reward Points", "API Credits", "Ride Credits", "Food Credits", "Other"];

  function startEditing(id: string, currentAmount: number) {
    setEditingId(id);
    setEditValue(String(currentAmount));
  }

  function startEditingType(id: string, currentType: string) {
    setEditingTypeId(id);
    setEditTypeValue(currentType);
  }

  async function saveAmount(id: string) {
    const parsed = parseFloat(editValue);
    if (isNaN(parsed) || parsed < 0) return;
    setSaving(true);
    try {
      await updateBalance(id, { amount: parsed });
      await queryClient.invalidateQueries({
        queryKey: balancesQueryOptions.queryKey,
      });
    } finally {
      setSaving(false);
      setEditingId(null);
    }
  }

  async function saveType(id: string) {
    if (!editTypeValue) return;
    setSaving(true);
    try {
      await updateBalance(id, { type: editTypeValue });
      await queryClient.invalidateQueries({
        queryKey: balancesQueryOptions.queryKey,
      });
    } finally {
      setSaving(false);
      setEditingTypeId(null);
    }
  }

  const totalBalance = balances.reduce((sum, b) => {
    if (b.type === "Reward Points") return sum;
    return sum + b.amount;
  }, 0);

  const totalPoints = balances
    .filter((b) => b.type === "Reward Points")
    .reduce((sum, b) => sum + b.amount, 0);

  const expiringSoon = balances.filter((b) => {
    if (!b.expiresAt) return false;
    const days = Math.ceil(
      (new Date(b.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return days <= 180;
  });

  return (
    <div className="rise-in space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Account Balances
          </h1>
          <p className="text-sm text-on-surface-variant">
            {balances.length} accounts tracked
          </p>
        </div>
        <Link
          to="/add"
          search={{ type: 'balance' }}
          className="signature-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-on-primary shadow-lg transition-transform hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Balance
        </Link>
      </div>

      {/* Total Balance Card */}
      <section className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
        <p className="text-sm font-medium text-on-surface-variant">
          Total Estimated Balance
        </p>
        <h2 className="font-headline mt-1 text-4xl font-bold tracking-tight text-on-surface lg:text-5xl">
          ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </h2>
        {totalPoints > 0 && (
          <p className="mt-2 text-sm text-on-surface-variant">
            + {totalPoints.toLocaleString()} reward points
          </p>
        )}
      </section>

      {/* Digital Balance Cards */}
      <section>
        <h2 className="font-headline mb-4 text-lg font-semibold text-on-surface">
          Digital Balances
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {balances.map((bal) => (
            <div
              key={bal.id}
              className="group rounded-xl bg-surface-container-lowest p-5 ambient-shadow transition-transform hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8">
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    {bal.icon}
                  </span>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-surface-container-high group-hover:opacity-100">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                    more_vert
                  </span>
                </button>
              </div>
              <p className="mt-3 text-sm font-medium text-on-surface">
                {bal.name}
              </p>
              {editingTypeId === bal.id ? (
                <form
                  className="mt-1 flex items-center gap-1.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveType(bal.id);
                  }}
                >
                  <select
                    value={editTypeValue}
                    onChange={(e) => setEditTypeValue(e.target.value)}
                    disabled={saving}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setEditingTypeId(null);
                    }}
                    className="flex-1 rounded-md bg-surface-variant px-2 py-1 text-xs text-on-surface focus:ring-2 focus:ring-primary/30 focus:outline-none"
                  >
                    {balanceTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTypeId(null)}
                    className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">close</span>
                  </button>
                </form>
              ) : (
                <p
                  className="cursor-pointer text-xs text-on-surface-variant rounded-md px-1 -mx-1 transition-colors hover:bg-surface-variant/50"
                  onClick={() => startEditingType(bal.id, bal.type)}
                  title="Click to edit type"
                >
                  {bal.type}
                </p>
              )}
              {editingId === bal.id ? (
                <form
                  className="mt-2 flex items-center gap-1.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveAmount(bal.id);
                  }}
                >
                  <div className="relative flex-1">
                    {bal.type !== "Reward Points" && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                        $
                      </span>
                    )}
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      disabled={saving}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className={`w-full rounded-md bg-surface-variant px-2 py-1 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 focus:outline-none ${bal.type !== "Reward Points" ? "pl-6" : ""}`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      check
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                      close
                    </span>
                  </button>
                </form>
              ) : (
                <p
                  className="font-headline mt-2 cursor-pointer text-xl font-bold text-on-surface rounded-md px-1 -mx-1 transition-colors hover:bg-surface-variant/50"
                  onClick={() => startEditing(bal.id, bal.amount)}
                  title="Click to edit balance"
                >
                  {bal.type === "Reward Points"
                    ? bal.amount.toLocaleString() + " pts"
                    : "$" + bal.amount.toFixed(2)}
                </p>
              )}
              {bal.expiresAt && (
                <p className="mt-1.5 text-xs text-tertiary">
                  Expires{" "}
                  {new Date(bal.expiresAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
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
            <span className="material-symbols-outlined text-[20px] text-tertiary">
              schedule
            </span>
            <h2 className="font-headline text-lg font-semibold text-on-surface">
              Expiring Credits
            </h2>
          </div>
          <div className="mt-4 space-y-3">
            {expiringSoon.map((bal) => {
              const days = Math.ceil(
                (new Date(bal.expiresAt!).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24),
              );
              return (
                <div
                  key={bal.id}
                  className="flex items-center gap-4 rounded-lg bg-tertiary-container/10 p-4"
                >
                  <span className="material-symbols-outlined text-[20px] text-tertiary">
                    {bal.icon}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">
                      {bal.name}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {bal.type === "Reward Points"
                        ? bal.amount.toLocaleString() + " pts"
                        : "$" + bal.amount.toFixed(2)}{" "}
                      &middot; Expires in {days} days
                    </p>
                  </div>
                  <span className="rounded-full bg-tertiary-container/20 px-2.5 py-1 text-xs font-medium text-tertiary">
                    {days}d left
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
