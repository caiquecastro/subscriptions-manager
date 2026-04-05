import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  BalanceForm,
  type BalanceFormValues,
  DEFAULT_BALANCE_VALUES,
} from "../components/BalanceForm";
import {
  SubscriptionForm,
  type SubscriptionFormValues,
} from "../components/SubscriptionForm";
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

  const [subError, setSubError] = useState("");
  const [balError, setBalError] = useState("");

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

  const handleBalanceSubmit = async (values: BalanceFormValues) => {
    setBalError("");
    try {
      await addBalance({
        name: values.name,
        type: values.type || "Store Credit",
        amount: parseFloat(values.amount),
        icon: "account_balance_wallet",
        expiresAt: values.expiresAt || undefined,
        notes: values.notes || undefined,
      });
      await queryClient.invalidateQueries({
        queryKey: balancesQueryOptions.queryKey,
      });
      navigate({ to: "/balances" });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to save. Check your connection and try again.";
      setBalError(msg);
      throw err;
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
        <div className="space-y-5 rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
          <BalanceForm
            defaultValues={DEFAULT_BALANCE_VALUES}
            onSubmit={handleBalanceSubmit}
            onCancel={() => navigate({ to: "/" })}
            submitLabel="Save Balance"
            cancelLabel="Discard Draft"
            error={balError}
          />
        </div>
      )}
    </div>
  );
}
