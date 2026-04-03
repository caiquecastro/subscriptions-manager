import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BalanceCard, formatBalanceAmount } from "../components/BalanceCard";
import { EditBalanceModal } from "../components/EditBalanceModal";
import type { Balance } from "../lib/firebase";
import { balancesQueryOptions } from "../lib/query";

export const Route = createFileRoute("/balances")({ component: Balances });

function Balances() {
  const { data: balances = [] } = useQuery(balancesQueryOptions);
  const [editingBalance, setEditingBalance] = useState<Balance | null>(null);

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
      (new Date(b.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
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
          search={{ type: "balance" }}
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
            <BalanceCard
              key={bal.id}
              balance={bal}
              onEdit={setEditingBalance}
            />
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
                (new Date(bal.expiresAt as string).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
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
                      {formatBalanceAmount(bal)} &middot; Expires in {days} days
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

      {/* Edit Modal */}
      {editingBalance && (
        <EditBalanceModal
          balance={editingBalance}
          onClose={() => setEditingBalance(null)}
        />
      )}
    </div>
  );
}
