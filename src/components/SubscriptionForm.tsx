import { useForm } from "@tanstack/react-form";
import { cn } from "../lib/cn";
import {
  type Currency,
  getCurrencySymbol,
  SUPPORTED_CURRENCIES,
} from "../lib/currency";
import type { Subscription } from "../lib/firebase";

export interface SubscriptionFormValues {
  cost: string;
  currency: Currency;
  name: string;
  category: string;
  billingCycle: "monthly" | "yearly" | "quarterly";
  nextRenewal: string;
  status: "active" | "paused" | "cancelled";
  notes: string;
}

interface SubscriptionFormProps {
  defaultValues: SubscriptionFormValues;
  onSubmit: (values: SubscriptionFormValues) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES = [
  "Entertainment",
  "Productivity",
  "Infrastructure",
  "Professional",
  "Health",
  "Utilities",
  "Development",
  "Design",
  "Cloud Storage",
  "Other",
];

export function subscriptionToFormValues(
  sub: Subscription
): SubscriptionFormValues {
  return {
    cost: String(sub.cost),
    currency: sub.currency ?? "BRL",
    name: sub.name,
    category: sub.category,
    billingCycle: sub.billingCycle,
    nextRenewal: sub.nextRenewal,
    status: sub.status,
    notes: sub.notes ?? "",
  };
}

export function SubscriptionForm({
  defaultValues,
  onSubmit,
  onCancel,
}: SubscriptionFormProps) {
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-5"
    >
      {/* Name */}
      <form.Field name="name">
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="mb-1.5 block text-sm font-medium text-on-surface"
            >
              Service Name
            </label>
            <input
              id={field.name}
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}
      </form.Field>

      {/* Cost + Currency */}
      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="cost">
          {(field) => (
            <form.Subscribe selector={(s) => s.values.currency}>
              {(currency) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="mb-1.5 block text-sm font-medium text-on-surface"
                  >
                    Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                      {getCurrencySymbol(currency)}
                    </span>
                    <input
                      id={field.name}
                      type="number"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full rounded-lg bg-surface-variant py-3 pl-8 pr-4 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              )}
            </form.Subscribe>
          )}
        </form.Field>

        <form.Field name="currency">
          {(field) => (
            <div>
              <p className="mb-1.5 text-sm font-medium text-on-surface">
                Currency
              </p>
              <div className="flex gap-2">
                {SUPPORTED_CURRENCIES.map((cur) => (
                  <button
                    type="button"
                    key={cur}
                    onClick={() => field.handleChange(cur)}
                    className={cn(
                      "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
                      field.state.value === cur
                        ? "bg-primary text-on-primary"
                        : "bg-surface-variant text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  >
                    {getCurrencySymbol(cur)} {cur}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form.Field>
      </div>

      {/* Category */}
      <form.Field name="category">
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="mb-1.5 block text-sm font-medium text-on-surface"
            >
              Category
            </label>
            <select
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </form.Field>

      {/* Billing Cycle */}
      <form.Field name="billingCycle">
        {(field) => (
          <div>
            <p className="mb-1.5 text-sm font-medium text-on-surface">
              Billing Cycle
            </p>
            <div className="flex gap-2">
              {(["monthly", "yearly", "quarterly"] as const).map((cycle) => (
                <button
                  type="button"
                  key={cycle}
                  onClick={() => field.handleChange(cycle)}
                  className={cn(
                    "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
                    field.state.value === cycle
                      ? "bg-primary text-on-primary"
                      : "bg-surface-variant text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </form.Field>

      {/* Next Renewal */}
      <form.Field name="nextRenewal">
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="mb-1.5 block text-sm font-medium text-on-surface"
            >
              Next Renewal Date
            </label>
            <input
              id={field.name}
              type="date"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}
      </form.Field>

      {/* Status */}
      <form.Field name="status">
        {(field) => (
          <div>
            <p className="mb-1.5 text-sm font-medium text-on-surface">Status</p>
            <div className="flex gap-2">
              {(["active", "paused", "cancelled"] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => field.handleChange(s)}
                  className={cn(
                    "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
                    field.state.value === s
                      ? "bg-primary text-on-primary"
                      : "bg-surface-variant text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </form.Field>

      {/* Notes */}
      <form.Field name="notes">
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="mb-1.5 block text-sm font-medium text-on-surface"
            >
              Notes (optional)
            </label>
            <textarea
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Add any notes..."
              rows={3}
              className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}
      </form.Field>

      {/* Actions */}
      <form.Subscribe selector={(s) => ({ isSubmitting: s.isSubmitting })}>
        {({ isSubmitting }) => (
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="signature-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-on-primary shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
