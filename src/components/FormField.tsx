import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../lib/cn";

export function Label({
  className,
  ...props
}: ComponentPropsWithoutRef<"label">) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-sm font-medium text-on-surface",
        className
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={cn(
        "w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: ComponentPropsWithoutRef<"select">) {
  return (
    <select
      className={cn(
        "w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30",
        className
      )}
      {...props}
    />
  );
}

interface SegmentedControlProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  getLabel?: (option: T) => ReactNode;
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  getLabel = (o) => o.charAt(0).toUpperCase() + o.slice(1),
}: SegmentedControlProps<T>) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-on-surface">{label}</p>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
              value === option
                ? "bg-primary text-on-primary"
                : "bg-surface-variant text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            {getLabel(option)}
          </button>
        ))}
      </div>
    </div>
  );
}
