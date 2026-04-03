import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { balancesQueryOptions, subscriptionsQueryOptions } from "../lib/query";
import { getMonthlySubscriptionCost } from "../lib/subscriptions";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const { data: subscriptions = [] } = useQuery(subscriptionsQueryOptions);
  const { data: balances = [] } = useQuery(balancesQueryOptions);

  const totalMonthly = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + getMonthlySubscriptionCost(s), 0);

  const totalBalance = balances.reduce((sum, b) => sum + b.amount, 0);

  const upcomingRenewals = subscriptions
    .filter((s) => s.status === "active")
    .sort(
      (a, b) =>
        new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime()
    )
    .slice(0, 3);

  const upcomingTotal = upcomingRenewals.reduce((sum, s) => sum + s.cost, 0);

  const recentSubs = subscriptions.slice(0, 4);

  return (
    <div className="rise-in space-y-6 py-4">
      {/* Portfolio Overview */}
      <section className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-on-surface-variant">
              Portfolio Overview
            </p>
            <h1 className="font-headline mt-1 text-4xl font-bold tracking-tight text-on-surface lg:text-5xl">
              $
              {totalBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
                <span className="material-symbols-outlined text-[14px]">
                  trending_up
                </span>
                +4.2%
              </span>
              <span className="text-xs text-on-surface-variant">
                Total Credits / Balance
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="rounded-lg bg-surface-container-low px-5 py-3">
              <p className="text-xs font-medium text-on-surface-variant">
                Monthly Cost
              </p>
              <p className="font-headline mt-0.5 text-xl font-bold text-on-surface">
                ${totalMonthly.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg bg-surface-container-low px-5 py-3">
              <p className="text-xs font-medium text-on-surface-variant">
                Active Subs
              </p>
              <p className="font-headline mt-0.5 text-xl font-bold text-on-surface">
                {subscriptions.filter((s) => s.status === "active").length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Renewals */}
      <section className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-lg font-semibold text-on-surface">
              Upcoming Renewals
            </h2>
            <p className="text-sm text-on-surface-variant">
              {upcomingRenewals.length} items &middot; $
              {upcomingTotal.toFixed(2)} total
            </p>
          </div>
          <Link
            to="/subscriptions"
            className="text-sm font-medium text-primary hover:text-primary-container"
          >
            View All
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {upcomingRenewals.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center gap-4 rounded-lg bg-surface-container-low p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary-container/20">
                <span className="material-symbols-outlined text-[20px] text-tertiary">
                  {sub.icon}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">
                  {sub.name}
                </p>
                <p className="text-xs text-on-surface-variant">
                  Renews{" "}
                  {new Date(sub.nextRenewal).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <p className="text-sm font-bold text-on-surface">
                ${sub.cost.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stored Value & Credits */}
        <section className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-lg font-semibold text-on-surface">
              Stored Value & Credits
            </h2>
            <Link
              to="/balances"
              className="text-sm font-medium text-primary hover:text-primary-container"
            >
              Manage
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {balances.slice(0, 4).map((bal) => (
              <div
                key={bal.id}
                className="rounded-lg bg-surface-container-low p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    {bal.icon}
                  </span>
                  <span className="text-xs font-medium text-on-surface-variant">
                    {bal.name}
                  </span>
                </div>
                <p className="font-headline mt-2 text-lg font-bold text-on-surface">
                  {bal.type === "Reward Points"
                    ? `${bal.amount.toLocaleString()} pts`
                    : `$${bal.amount.toFixed(2)}`}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Renewals */}
        <section className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
          <h2 className="font-headline text-lg font-semibold text-on-surface">
            Recent Renewals
          </h2>
          <div className="mt-4 space-y-3">
            {recentSubs.map((sub) => (
              <div key={sub.id} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    {sub.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface">
                    {sub.name}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {sub.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-on-surface">
                    ${sub.cost.toFixed(2)}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    /
                    {sub.billingCycle === "monthly"
                      ? "mo"
                      : sub.billingCycle === "yearly"
                        ? "yr"
                        : "qtr"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Smart Savings Insights */}
      <section className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">
            lightbulb
          </span>
          <h2 className="font-headline text-lg font-semibold text-on-surface">
            Smart Savings Insights
          </h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-secondary/5 p-4">
            <p className="text-sm font-semibold text-secondary">
              Review Storage Plans
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Your iCloud+ and Google Drive plans overlap. You could save ~$3/mo
              by consolidating.
            </p>
            <button
              type="button"
              className="mt-3 text-xs font-semibold text-secondary"
            >
              Review Storage →
            </button>
          </div>
          <div className="rounded-lg bg-tertiary/5 p-4">
            <p className="text-sm font-semibold text-tertiary">
              Amazon Credit Expiring
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Your $500 Amazon gift card balance should be used before June
              2027.
            </p>
            <button
              type="button"
              className="mt-3 text-xs font-semibold text-tertiary"
            >
              View Balance →
            </button>
          </div>
          <div className="rounded-lg bg-primary/5 p-4">
            <p className="text-sm font-semibold text-primary">
              Connect Bank Account
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Link your bank for automatic subscription detection and balance
              tracking.
            </p>
            <button
              type="button"
              className="mt-3 text-xs font-semibold text-primary"
            >
              Connect Now →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
