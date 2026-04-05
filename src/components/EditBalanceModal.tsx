import { Dialog } from "@base-ui/react/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { type Balance, updateBalance } from "../lib/firebase";
import { balancesQueryOptions } from "../lib/query";
import { BalanceForm, balanceToFormValues, type BalanceFormValues } from "./BalanceForm";

export function EditBalanceModal({
  balance,
  onClose,
}: {
  balance: Balance;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  async function handleSubmit(values: BalanceFormValues) {
    setError("");
    try {
      await updateBalance(balance.id, {
        name: values.name,
        type: values.type || balance.type,
        amount: parseFloat(values.amount),
        expiresAt: values.expiresAt || undefined,
        notes: values.notes || undefined,
      });
      await queryClient.invalidateQueries({
        queryKey: balancesQueryOptions.queryKey,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save. Try again."
      );
      throw err;
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

            <div className="mt-5">
              <BalanceForm
                defaultValues={balanceToFormValues(balance)}
                onSubmit={handleSubmit}
                onCancel={onClose}
                submitLabel="Save"
                error={error}
              />
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
