import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { cn } from "../lib/cn";
import { formatCurrency } from "../lib/currency";
import { invoicesQueryOptions, subscriptionsQueryOptions } from "../lib/query";

export const Route = createFileRoute("/invoices")({
  component: Invoices,
});

type StatusFilter = "all" | "paid" | "pending";

function Invoices() {
  const { data: invoices = [] } = useQuery(invoicesQueryOptions);
  const { data: subscriptions = [] } = useQuery(subscriptionsQueryOptions);

  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const subscriptionsById = useMemo(
    () => new Map(subscriptions.map((s) => [s.id, s])),
    [subscriptions]
  );

  const filtered = useMemo(
    () =>
      invoices.filter((inv) => {
        if (
          subscriptionFilter !== "all" &&
          inv.subscriptionId !== subscriptionFilter
        ) {
          return false;
        }
        if (statusFilter !== "all" && inv.status !== statusFilter) {
          return false;
        }
        return true;
      }),
    [invoices, subscriptionFilter, statusFilter]
  );

  const totalPaid = filtered
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amountBRL, 0);

  const totalPending = filtered
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.amountBRL, 0);

  return (
    <div className="rise-in space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Invoices
          </h1>
          <p className="text-sm text-on-surface-variant">
            {filtered.length} records &middot;{" "}
            {formatCurrency(totalPaid, "BRL")} paid
            {totalPending > 0 && (
              <> &middot; {formatCurrency(totalPending, "BRL")} pending</>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label
            htmlFor="invoice-subscription-filter"
            className="text-xs text-on-surface-variant"
          >
            Subscription:
          </label>
          <select
            id="invoice-subscription-filter"
            value={subscriptionFilter}
            onChange={(e) => setSubscriptionFilter(e.target.value)}
            className="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All</option>
            {subscriptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant">Status:</span>
          {(["all", "paid", "pending"] as const).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium capitalize",
                statusFilter === s
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-surface-container-lowest py-16 ambient-shadow">
          <span className="material-symbols-outlined text-[40px] text-on-surface-variant">
            receipt_long
          </span>
          <p className="text-sm text-on-surface-variant">No invoices found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-surface-container-lowest ambient-shadow">
          {/* Desktop table */}
          <table className="hidden w-full text-left text-sm sm:table">
            <thead className="border-b border-outline-variant/20 text-xs uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Subscription</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Notes</th>
                <th className="w-10 px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice) => {
                const subscription = subscriptionsById.get(
                  invoice.subscriptionId
                );
                return (
                  <tr
                    key={invoice.id}
                    className="group border-b border-outline-variant/10 last:border-0 transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to="/invoices/$id"
                        params={{ id: invoice.id }}
                        className="block font-medium text-on-surface"
                      >
                        {new Date(invoice.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      {subscription ? (
                        <Link
                          to="/subscriptions/$id"
                          params={{ id: subscription.id }}
                          className="inline-flex items-center gap-2 text-on-surface hover:text-primary"
                        >
                          <span className="material-symbols-outlined text-[18px] text-primary">
                            {subscription.icon}
                          </span>
                          {subscription.name}
                        </Link>
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold text-on-surface">
                      {formatCurrency(invoice.amountBRL, "BRL")}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                          invoice.status === "paid"
                            ? "bg-secondary/10 text-secondary"
                            : "bg-tertiary-container/20 text-tertiary"
                        )}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-5 py-4 text-xs text-on-surface-variant">
                      {invoice.notes ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {invoice.fileUrl && (
                          <a
                            href={invoice.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-container-high"
                            title={invoice.fileName ?? "View file"}
                          >
                            <span className="material-symbols-outlined text-[16px] text-primary">
                              attachment
                            </span>
                          </a>
                        )}
                        <Link
                          to="/invoices/$id"
                          params={{ id: invoice.id }}
                          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-container-high"
                          title="View invoice"
                        >
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                            chevron_right
                          </span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="divide-y divide-outline-variant/10 sm:hidden">
            {filtered.map((invoice) => {
              const subscription = subscriptionsById.get(
                invoice.subscriptionId
              );
              return (
                <Link
                  key={invoice.id}
                  to="/invoices/$id"
                  params={{ id: invoice.id }}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-container-low"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8">
                    <span className="material-symbols-outlined text-[20px] text-primary">
                      {subscription?.icon ?? "receipt"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-on-surface">
                      {subscription?.name ?? "Unknown subscription"}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {new Date(invoice.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-bold text-on-surface">
                      {formatCurrency(invoice.amountBRL, "BRL")}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                        invoice.status === "paid"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-tertiary-container/20 text-tertiary"
                      )}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
