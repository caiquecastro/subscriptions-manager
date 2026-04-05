import { formatShortMonthDayYear } from "../lib/date";
import type { Balance } from "../lib/firebase";

export const BALANCE_TYPES = [
  "Store Credit",
  "Gift Card",
  "Reward Points",
  "API Credits",
  "Ride Credits",
  "Food Credits",
  "Other",
];

export function formatBalanceAmount(balance: Balance) {
  return balance.type === "Reward Points"
    ? `${balance.amount.toLocaleString()} pts`
    : `$${balance.amount.toFixed(2)}`;
}

export function BalanceCard({
  balance,
  onEdit,
}: {
  balance: Balance;
  onEdit: (balance: Balance) => void;
}) {
  return (
    <div className="group w-full rounded-xl bg-surface-container-lowest p-5 text-left ambient-shadow transition-transform">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8">
          <span className="material-symbols-outlined text-[20px] text-primary">
            {balance.icon}
          </span>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-surface-container-high group-hover:opacity-100 cursor-pointer"
          onClick={() => onEdit(balance)}
        >
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
            edit
          </span>
        </button>
      </div>
      <p className="mt-3 text-sm font-medium text-on-surface">{balance.name}</p>
      <p className="text-xs text-on-surface-variant">{balance.type}</p>
      <p className="font-headline mt-2 text-xl font-bold text-on-surface">
        {formatBalanceAmount(balance)}
      </p>
      {balance.expiresAt && (
        <p className="mt-1.5 text-xs text-tertiary">
          Expires {formatShortMonthDayYear(balance.expiresAt)}
        </p>
      )}
    </div>
  );
}
