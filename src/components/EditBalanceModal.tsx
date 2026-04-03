import { Dialog } from "@base-ui/react/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "../lib/cn";
import { type Balance, updateBalance } from "../lib/firebase";
import { balancesQueryOptions } from "../lib/query";
import { BALANCE_TYPES } from "./BalanceCard";

export function EditBalanceModal({
  balance,
  onClose,
}: {
  balance: Balance;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [type, setType] = useState(balance.type);
  const [amount, setAmount] = useState(String(balance.amount));
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed) || parsed < 0) return;
    setSaving(true);
    try {
      await updateBalance(balance.id, { type, amount: parsed });
      await queryClient.invalidateQueries({
        queryKey: balancesQueryOptions.queryKey,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[60] bg-black/50" />
        <Dialog.Popup className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <Dialog.Title className="font-headline text-lg font-semibold text-on-surface">
                Edit Balance
              </Dialog.Title>
              <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-container-high">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  close
                </span>
              </Dialog.Close>
            </div>

            <Dialog.Description className="mt-1 text-sm text-on-surface-variant">
              {balance.name}
            </Dialog.Description>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="edit-balance-type"
                  className="mb-1.5 block text-sm font-medium text-on-surface"
                >
                  Type
                </label>
                <select
                  id="edit-balance-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={saving}
                  className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
                >
                  {BALANCE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-balance-amount"
                  className="mb-1.5 block text-sm font-medium text-on-surface"
                >
                  Amount
                </label>
                <div className="relative">
                  {type !== "Reward Points" && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                      $
                    </span>
                  )}
                  <input
                    id="edit-balance-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={saving}
                    className={cn(
                      "w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30",
                      type !== "Reward Points" && "pl-8",
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Dialog.Close
                  disabled={saving}
                  className="flex-1 rounded-xl bg-surface-variant px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
                  render={<button type="button" />}
                >
                  Cancel
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={saving}
                  className="signature-gradient flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-on-primary shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
