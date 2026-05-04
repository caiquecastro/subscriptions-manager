import { Link } from "@tanstack/react-router";
import { cn } from "../lib/cn";
import { formatCurrency } from "../lib/currency";
import { getDaysUntilRenewal } from "../lib/date";
import type { Subscription } from "../lib/firebase";

export function SubscriptionCard({
  subscription,
  isCancelling = false,
  onCancel,
}: {
  subscription: Subscription;
  isCancelling?: boolean;
  onCancel: (subscription: Subscription) => void;
}) {
  const daysUntil = getDaysUntilRenewal(subscription);
  const isCancelled = subscription.status === "cancelled";

  return (
    <article className="group rounded-xl bg-surface-container-lowest p-5 ambient-shadow transition-transform hover:scale-[1.01]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/8">
            <span className="material-symbols-outlined text-[22px] text-primary">
              {subscription.icon}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">
              {subscription.name}
            </p>
            <p className="text-xs text-on-surface-variant">
              {subscription.category}
            </p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Link
            to="/subscriptions/$id"
            params={{ id: subscription.id }}
            search={{ edit: true }}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-container-high"
            title="Edit subscription"
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              edit
            </span>
          </Link>
          <button
            type="button"
            onClick={() => onCancel(subscription)}
            disabled={isCancelled || isCancelling}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-error-container/30 disabled:cursor-not-allowed disabled:opacity-50"
            title={
              isCancelled
                ? "Subscription already cancelled"
                : "Cancel subscription"
            }
          >
            <span className="material-symbols-outlined text-[16px] text-error">
              {isCancelling ? "progress_activity" : "cancel"}
            </span>
          </button>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="font-headline text-2xl font-bold text-on-surface">
            {formatCurrency(subscription.cost, subscription.currency)}
          </p>
          <p className="text-xs text-on-surface-variant">
            /
            {subscription.billingCycle === "monthly"
              ? "month"
              : subscription.billingCycle === "yearly"
                ? "year"
                : "quarter"}
          </p>
        </div>
        <div className="text-right">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
              daysUntil <= 3
                ? "bg-error-container/30 text-error"
                : daysUntil <= 7
                  ? "bg-tertiary-container/20 text-tertiary"
                  : "bg-surface-container-high text-on-surface-variant"
            )}
          >
            {daysUntil <= 0 ? "Due today" : `${daysUntil}d until renewal`}
          </span>
        </div>
      </div>
    </article>
  );
}
