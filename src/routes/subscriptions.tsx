import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { cn } from "../lib/cn";
import { formatCurrency } from "../lib/currency";
import { compareDateStrings, isRenewalWithinDays } from "../lib/date";
import { subscriptionsQueryOptions } from "../lib/query";
import { getMonthlySubscriptionCost } from "../lib/subscriptions";

export const Route = createFileRoute("/subscriptions")({
  component: Subscriptions,
});

const categories = [
  "All",
  "Entertainment",
  "Productivity",
  "Infrastructure",
  "Professional",
  "Health",
  "Utilities",
  "Development",
  "Design",
  "Cloud Storage",
];

function Subscriptions() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"renewal" | "price" | "name">("renewal");
  const { data: subscriptions = [] } = useQuery(subscriptionsQueryOptions);

  const filtered = subscriptions
    .filter((s) => activeCategory === "All" || s.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === "renewal")
        return compareDateStrings(a.nextRenewal, b.nextRenewal);
      if (sortBy === "price")
        return getMonthlySubscriptionCost(b) - getMonthlySubscriptionCost(a);
      return a.name.localeCompare(b.name);
    });

  const monthlyByCurrency = subscriptions
    .filter((s) => s.status === "active")
    .reduce(
      (acc, s) => {
        const cur = s.currency ?? "USD";
        acc[cur] = (acc[cur] || 0) + getMonthlySubscriptionCost(s);
        return acc;
      },
      {} as Record<string, number>
    );

  const totalMonthly = Object.values(monthlyByCurrency).reduce(
    (sum, v) => sum + v,
    0
  );

  const urgentRenewals = subscriptions.filter((s) => isRenewalWithinDays(s, 3));

  const highestCost = [...subscriptions]
    .filter((s) => s.status === "active")
    .sort(
      (a, b) => getMonthlySubscriptionCost(b) - getMonthlySubscriptionCost(a)
    )[0];
  const highestMonthlyCost = highestCost
    ? getMonthlySubscriptionCost(highestCost)
    : 0;
  const highestPercent = highestCost
    ? Math.round((highestMonthlyCost / totalMonthly) * 100)
    : 0;

  return (
    <div className="rise-in space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            My Subscriptions
          </h1>
          <p className="text-sm text-on-surface-variant">
            {subscriptions.filter((s) => s.status === "active").length} active
            &middot;{" "}
            {Object.entries(monthlyByCurrency)
              .map(
                ([cur, amount]) =>
                  `${formatCurrency(amount, cur as "BRL" | "USD" | "EUR")}/mo`
              )
              .join(" + ")}{" "}
            total
          </p>
        </div>
        <Link
          to="/add"
          search={{ type: "subscription" }}
          className="signature-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-on-primary shadow-lg transition-transform hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Subscription
        </Link>
      </div>

      {/* Alerts */}
      {urgentRenewals.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl bg-error-container/30 p-4">
          <span className="material-symbols-outlined text-[20px] text-error">
            warning
          </span>
          <div>
            <p className="text-sm font-semibold text-on-error-container">
              Urgent Renewal
            </p>
            <p className="text-xs text-on-surface-variant">
              {urgentRenewals[0].name} renews within 48 hours —{" "}
              {formatCurrency(
                urgentRenewals[0].cost,
                urgentRenewals[0].currency
              )}
            </p>
          </div>
        </div>
      )}

      {highestCost && highestPercent > 30 && (
        <div className="flex items-start gap-3 rounded-xl bg-tertiary-container/10 p-4">
          <span className="material-symbols-outlined text-[20px] text-tertiary">
            insights
          </span>
          <div>
            <p className="text-sm font-semibold text-on-tertiary-container">
              High-Cost Alert
            </p>
            <p className="text-xs text-on-surface-variant">
              {highestCost.name} is {highestPercent}% of your monthly spend (
              {formatCurrency(highestMonthlyCost, highestCost.currency)}/mo)
            </p>
          </div>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                activeCategory === cat
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant">Sort by:</span>
          {(["renewal", "price", "name"] as const).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium",
                sortBy === s
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Subscription Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((sub) => (
          <SubscriptionCard key={sub.id} subscription={sub} />
        ))}
      </div>
    </div>
  );
}
