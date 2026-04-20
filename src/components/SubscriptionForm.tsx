import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  type Currency,
  getCurrencySymbol,
  SUPPORTED_CURRENCIES,
} from "../lib/currency";
import type { Subscription } from "../lib/firebase";
import { type ServiceSuggestion, suggestService } from "../lib/servicesSuggestion";
import { Input, Label, SegmentedControl, Select, Textarea } from "./FormField";

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
  submitLabel?: string;
  cancelLabel?: string;
  error?: string;
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
  "Education",
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
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  error,
}: SubscriptionFormProps) {
  const [suggestion, setSuggestion] = useState<ServiceSuggestion | null>(null);

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
            <Label htmlFor={field.name}>Service Name</Label>
            <Input
              id={field.name}
              type="text"
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
                setSuggestion(null);
              }}
              onBlur={() => setSuggestion(suggestService(field.state.value))}
            />
            {suggestion && (
              <p className="mt-1.5 text-sm text-on-surface-variant">
                Did you mean{" "}
                <button
                  type="button"
                  className="font-medium text-primary underline underline-offset-2"
                  onClick={() => {
                    field.handleChange(suggestion.name);
                    form.setFieldValue("category", suggestion.category);
                    setSuggestion(null);
                  }}
                >
                  {suggestion.name}
                </button>
                ?
              </p>
            )}
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
                  <Label htmlFor={field.name}>Cost</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                      {getCurrencySymbol(currency)}
                    </span>
                    <Input
                      id={field.name}
                      type="number"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="py-3 pl-10 pr-4"
                    />
                  </div>
                </div>
              )}
            </form.Subscribe>
          )}
        </form.Field>

        <form.Field name="currency">
          {(field) => (
            <SegmentedControl
              label="Currency"
              options={SUPPORTED_CURRENCIES}
              value={field.state.value}
              onChange={field.handleChange}
              getLabel={(cur) => `${getCurrencySymbol(cur)} ${cur}`}
            />
          )}
        </form.Field>
      </div>

      {/* Category */}
      <form.Field name="category">
        {(field) => (
          <div>
            <Label htmlFor={field.name}>Category</Label>
            <Select
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>
        )}
      </form.Field>

      {/* Billing Cycle */}
      <form.Field name="billingCycle">
        {(field) => (
          <SegmentedControl
            label="Billing Cycle"
            options={["monthly", "yearly", "quarterly"] as const}
            value={field.state.value}
            onChange={field.handleChange}
          />
        )}
      </form.Field>

      {/* Next Renewal */}
      <form.Field name="nextRenewal">
        {(field) => (
          <div>
            <Label htmlFor={field.name}>Next Renewal Date</Label>
            <Input
              id={field.name}
              type="date"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      {/* Status */}
      <form.Field name="status">
        {(field) => (
          <SegmentedControl
            label="Status"
            options={["active", "paused", "cancelled"] as const}
            value={field.state.value}
            onChange={field.handleChange}
          />
        )}
      </form.Field>

      {/* Notes */}
      <form.Field name="notes">
        {(field) => (
          <div>
            <Label htmlFor={field.name}>Notes (optional)</Label>
            <Textarea
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Add any notes..."
              rows={3}
            />
          </div>
        )}
      </form.Field>

      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-error-container/30 p-3">
          <span className="material-symbols-outlined text-[18px] text-error">
            error
          </span>
          <p className="text-sm text-on-error-container">{error}</p>
        </div>
      )}

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
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="signature-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-on-primary shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
