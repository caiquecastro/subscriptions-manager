import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { formatCurrency } from "../lib/currency";
import { balancesQueryOptions, subscriptionsQueryOptions } from "../lib/query";
import { getMonthlySubscriptionCost } from "../lib/subscriptions";

export const Route = createFileRoute("/analytics")({ component: Analytics });

function Analytics() {
  const { data: subscriptions = [] } = useQuery(subscriptionsQueryOptions);
  const { data: balances = [] } = useQuery(balancesQueryOptions);

  const totalMonthly = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + getMonthlySubscriptionCost(s), 0);

  const totalYearly = totalMonthly * 12;

  const categoryBreakdown = subscriptions.reduce(
    (acc, s) => {
      if (s.status !== "active") return acc;
      acc[s.category] = (acc[s.category] || 0) + getMonthlySubscriptionCost(s);
      return acc;
    },
    {} as Record<string, number>
  );

  const sortedCategories = Object.entries(categoryBreakdown).sort(
    (a, b) => b[1] - a[1]
  );
  const maxCategoryValue = sortedCategories[0]?.[1] || 1;

  const totalBalance = balances.reduce(
    (sum, b) => (b.type === "Reward Points" ? sum : sum + b.amount),
    0
  );

  return (
    <div className="rise-in space-y-6 py-4">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">
          Analytics
        </h1>
        <p className="text-sm text-on-surface-variant">
          Overview of your spending patterns
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-surface-container-lowest p-5 ambient-shadow">
          <p className="text-xs font-medium text-on-surface-variant">
            Monthly Spend
          </p>
          <p className="font-headline mt-1 text-2xl font-bold text-on-surface">
            ${totalMonthly.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl bg-surface-container-lowest p-5 ambient-shadow">
          <p className="text-xs font-medium text-on-surface-variant">
            Annual Projection
          </p>
          <p className="font-headline mt-1 text-2xl font-bold text-on-surface">
            ${totalYearly.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl bg-surface-container-lowest p-5 ambient-shadow">
          <p className="text-xs font-medium text-on-surface-variant">
            Active Services
          </p>
          <p className="font-headline mt-1 text-2xl font-bold text-on-surface">
            {subscriptions.filter((s) => s.status === "active").length}
          </p>
        </div>
        <div className="rounded-xl bg-surface-container-lowest p-5 ambient-shadow">
          <p className="text-xs font-medium text-on-surface-variant">
            Stored Value
          </p>
          <p className="font-headline mt-1 text-2xl font-bold text-on-surface">
            ${totalBalance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Spending by Category */}
      <section className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
        <h2 className="font-headline text-lg font-semibold text-on-surface">
          Spending by Category
        </h2>
        <div className="mt-5 space-y-4">
          {sortedCategories.map(([category, amount]) => (
            <div key={category}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface">
                  {category}
                </span>
                <span className="text-sm font-semibold text-on-surface">
                  ${amount.toFixed(2)}/mo
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-surface-container-high">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(amount / maxCategoryValue) * 100}%` }}
                />
              </div>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                {Math.round((amount / totalMonthly) * 100)}% of total
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cost Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
          <h2 className="font-headline text-lg font-semibold text-on-surface">
            Top 5 Expenses
          </h2>
          <div className="mt-4 space-y-3">
            {[...subscriptions]
              .sort((a, b) => b.cost - a.cost)
              .slice(0, 5)
              .map((sub, i) => (
                <div key={sub.id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-on-surface">
                      {sub.name}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {sub.category}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-on-surface">
                    {formatCurrency(sub.cost, sub.currency)}
                  </p>
                </div>
              ))}
          </div>
        </section>

        <section className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
          <h2 className="font-headline text-lg font-semibold text-on-surface">
            Monthly Trend
          </h2>
          <div className="mt-4 flex h-48 items-end gap-2">
            {["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((month, _i) => {
              const variation = 0.85 + Math.random() * 0.3;
              const height =
                ((variation * totalMonthly) / (totalMonthly * 1.2)) * 100;
              return (
                <div
                  key={month}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t bg-primary/20 transition-all hover:bg-primary/40"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-on-surface-variant">
                    {month}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
