import { useForm } from "@tanstack/react-form";
import type { Balance } from "../lib/firebase";
import { BALANCE_TYPES } from "./BalanceCard";
import { Input, Label, Select, Textarea } from "./FormField";

export interface BalanceFormValues {
  name: string;
  amount: string;
  type: string;
  expiresAt: string;
  notes: string;
}

export interface BalanceFormProps {
  defaultValues: BalanceFormValues;
  onSubmit: (values: BalanceFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  error?: string;
}

export function balanceToFormValues(balance: Balance): BalanceFormValues {
  return {
    name: balance.name,
    amount: String(balance.amount),
    type: balance.type,
    expiresAt: balance.expiresAt ?? "",
    notes: balance.notes ?? "",
  };
}

export const DEFAULT_BALANCE_VALUES: BalanceFormValues = {
  name: "",
  amount: "",
  type: "",
  expiresAt: "",
  notes: "",
};

export function BalanceForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  error,
}: BalanceFormProps) {
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
      className="space-y-4"
    >
      {/* Name */}
      <form.Field name="name">
        {(field) => (
          <div>
            <Label htmlFor={field.name}>Account Name</Label>
            <Input
              id={field.name}
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g., Apple ID, Amazon..."
            />
          </div>
        )}
      </form.Field>

      {/* Amount */}
      <form.Field name="amount">
        {(field) => (
          <form.Subscribe selector={(s) => s.values.type}>
            {(type) => (
              <div>
                <Label htmlFor={field.name}>
                  {type === "Reward Points" ? "Points" : "Amount"}
                </Label>
                <div className="relative">
                  {type !== "Reward Points" && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                      $
                    </span>
                  )}
                  <Input
                    id={field.name}
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={
                      type !== "Reward Points" ? "py-3 pl-8 pr-4" : undefined
                    }
                  />
                </div>
              </div>
            )}
          </form.Subscribe>
        )}
      </form.Field>

      {/* Type */}
      <form.Field name="type">
        {(field) => (
          <div>
            <Label htmlFor={field.name}>Balance Type</Label>
            <Select
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              <option value="">Select type...</option>
              {BALANCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
        )}
      </form.Field>

      {/* Expiration Date */}
      <form.Field name="expiresAt">
        {(field) => (
          <div>
            <Label htmlFor={field.name}>Expiration Date (optional)</Label>
            <Input
              id={field.name}
              type="date"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
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
              placeholder="Add any notes about this entry..."
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
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-surface-variant px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="signature-gradient flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-on-primary shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
