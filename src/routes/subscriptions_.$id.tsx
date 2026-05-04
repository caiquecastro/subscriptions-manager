import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  SubscriptionForm,
  type SubscriptionFormValues,
  subscriptionToFormValues,
} from "../components/SubscriptionForm";
import { useAuth } from "../lib/auth";
import { cn } from "../lib/cn";
import { formatCurrency } from "../lib/currency";
import {
  formatInvoiceDate,
  formatShortMonthDay,
  getDaysUntilRenewal,
} from "../lib/date";
import {
  addInvoice,
  deleteInvoice,
  type Invoice,
  type Subscription,
  updateSubscription,
} from "../lib/firebase";
import {
  subscriptionInvoicesQueryOptions,
  subscriptionsQueryOptions,
} from "../lib/query";
import { uploadInvoiceFile } from "../lib/storage";

export const Route = createFileRoute("/subscriptions_/$id")({
  component: SubscriptionDetail,
  validateSearch: (search: Record<string, unknown>): { edit?: boolean } => ({
    edit: search.edit === true || search.edit === "true" ? true : undefined,
  }),
});

function SubscriptionDetail() {
  const { id } = Route.useParams();
  const { edit } = Route.useSearch();
  const { data: subscriptions = [] } = useQuery(subscriptionsQueryOptions);
  const subscription = subscriptions.find((s) => s.id === id);

  if (!subscription) {
    return (
      <div className="rise-in flex flex-col items-center justify-center gap-4 py-20">
        <span className="material-symbols-outlined text-[48px] text-on-surface-variant">
          search_off
        </span>
        <p className="text-on-surface-variant">Subscription not found</p>
        <Link
          to="/subscriptions"
          className="text-sm font-medium text-primary hover:text-primary-container"
        >
          Back to Subscriptions
        </Link>
      </div>
    );
  }

  return (
    <div className="rise-in mx-auto max-w-3xl space-y-6 py-4">
      {/* Back link */}
      <Link
        to="/subscriptions"
        className="inline-flex items-center gap-1 text-sm font-medium text-on-surface-variant hover:text-on-surface"
      >
        <span className="material-symbols-outlined text-[18px]">
          arrow_back
        </span>
        Back to Subscriptions
      </Link>

      {/* Subscription Info */}
      <SubscriptionHeader
        initialEditing={edit === true}
        subscription={subscription}
      />

      {/* Invoices */}
      <InvoiceSection subscription={subscription} />
    </div>
  );
}

function SubscriptionHeader({
  initialEditing,
  subscription,
}: {
  initialEditing?: boolean;
  subscription: Subscription;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(initialEditing ?? false);
  const [error, setError] = useState("");
  const daysUntil = getDaysUntilRenewal(subscription);

  useEffect(() => {
    if (initialEditing) setEditing(true);
  }, [initialEditing]);

  const handleSave = async (values: SubscriptionFormValues) => {
    setError("");
    try {
      await updateSubscription(subscription.id, {
        name: values.name,
        category: values.category,
        cost: parseFloat(values.cost),
        currency: values.currency,
        billingCycle: values.billingCycle,
        nextRenewal: values.nextRenewal,
        status: values.status,
        notes: values.notes || undefined,
      });
      await queryClient.invalidateQueries({
        queryKey: subscriptionsQueryOptions.queryKey,
      });
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save. Try again."
      );
      throw err;
    }
  };

  if (editing) {
    return (
      <section className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/8">
            <span className="material-symbols-outlined text-[28px] text-primary">
              {subscription.icon}
            </span>
          </div>
          <h2 className="font-headline text-xl font-bold text-on-surface">
            Edit Subscription
          </h2>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-xl bg-error-container/30 p-3">
            <span className="material-symbols-outlined text-[18px] text-error">
              error
            </span>
            <p className="text-sm text-on-error-container">{error}</p>
          </div>
        )}

        <SubscriptionForm
          defaultValues={subscriptionToFormValues(subscription)}
          onSubmit={handleSave}
          onCancel={() => {
            setEditing(false);
            setError("");
          }}
        />
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/8">
          <span className="material-symbols-outlined text-[28px] text-primary">
            {subscription.icon}
          </span>
        </div>
        <div className="flex-1">
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            {subscription.name}
          </h1>
          <p className="text-sm text-on-surface-variant">
            {subscription.category}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
              subscription.status === "active"
                ? "bg-secondary/10 text-secondary"
                : subscription.status === "paused"
                  ? "bg-tertiary-container/20 text-tertiary"
                  : "bg-error-container/30 text-error"
            )}
          >
            {subscription.status}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-container-high"
            title="Edit subscription"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              edit
            </span>
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-surface-container-low p-4">
          <p className="text-xs font-medium text-on-surface-variant">Cost</p>
          <p className="font-headline mt-1 text-xl font-bold text-on-surface">
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
        <div className="rounded-lg bg-surface-container-low p-4">
          <p className="text-xs font-medium text-on-surface-variant">
            Next Renewal
          </p>
          <p className="font-headline mt-1 text-xl font-bold text-on-surface">
            {formatShortMonthDay(subscription.nextRenewal)}
          </p>
          <p className="text-xs text-on-surface-variant">
            {daysUntil <= 0 ? "Due today" : `in ${daysUntil} days`}
          </p>
        </div>
        <div className="rounded-lg bg-surface-container-low p-4">
          <p className="text-xs font-medium text-on-surface-variant">
            Currency
          </p>
          <p className="font-headline mt-1 text-xl font-bold text-on-surface">
            {subscription.currency}
          </p>
        </div>
      </div>

      {subscription.notes && (
        <div className="mt-4 rounded-lg bg-surface-container-low p-4">
          <p className="text-xs font-medium text-on-surface-variant">Notes</p>
          <p className="mt-1 text-sm text-on-surface">{subscription.notes}</p>
        </div>
      )}
    </section>
  );
}

function InvoiceSection({ subscription }: { subscription: Subscription }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: invoices = [] } = useQuery(
    subscriptionInvoicesQueryOptions(subscription.id)
  );
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const totalPaidBRL = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amountBRL, 0);

  const handleDelete = async (invoiceId: string) => {
    setDeleting(invoiceId);
    try {
      await deleteInvoice(invoiceId);
      await queryClient.invalidateQueries({
        queryKey: ["invoices", subscription.id],
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-lg font-semibold text-on-surface">
            Invoices
          </h2>
          <p className="text-sm text-on-surface-variant">
            {invoices.length} records &middot;{" "}
            {formatCurrency(totalPaidBRL, "BRL")} paid total
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="signature-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-on-primary shadow-lg transition-transform hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-[18px]">
            {showForm ? "close" : "add"}
          </span>
          {showForm ? "Cancel" : "Add Invoice"}
        </button>
      </div>

      {showForm && user && (
        <AddInvoiceForm
          subscriptionId={subscription.id}
          userId={user.uid}
          onSaved={() => {
            setShowForm(false);
            queryClient.invalidateQueries({
              queryKey: ["invoices", subscription.id],
            });
          }}
        />
      )}

      {/* Invoice List */}
      <div className="mt-5 space-y-3">
        {invoices.length === 0 && !showForm && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant">
              receipt_long
            </span>
            <p className="text-sm text-on-surface-variant">
              No invoices yet. Add your first invoice to start tracking
              payments.
            </p>
          </div>
        )}
        {invoices.map((invoice) => (
          <InvoiceRow
            key={invoice.id}
            invoice={invoice}
            onDelete={() => handleDelete(invoice.id)}
            isDeleting={deleting === invoice.id}
          />
        ))}
      </div>
    </section>
  );
}

function AddInvoiceForm({
  subscriptionId,
  userId,
  onSaved,
}: {
  subscriptionId: string;
  userId: string;
  onSaved: () => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amountBRL, setAmountBRL] = useState("");
  const [status, setStatus] = useState<"paid" | "pending">("paid");
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!date || !amountBRL) return;
    setSaving(true);
    setError("");

    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;

      if (file) {
        const result = await uploadInvoiceFile(file, userId);
        fileUrl = result.url;
        fileName = result.name;
      }

      await addInvoice({
        subscriptionId,
        date,
        amountBRL: Number.parseFloat(amountBRL),
        status,
        fileUrl,
        fileName,
        notes: notes || undefined,
      });

      onSaved();
    } catch (err) {
      setSaving(false);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save invoice. Try again."
      );
    }
  };

  return (
    <div className="mt-5 space-y-4 rounded-xl bg-surface-container-low p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Date */}
        <div>
          <label
            htmlFor="invoice-date"
            className="mb-1.5 block text-sm font-medium text-on-surface"
          >
            Payment Date
          </label>
          <input
            id="invoice-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Amount BRL */}
        <div>
          <label
            htmlFor="invoice-amount"
            className="mb-1.5 block text-sm font-medium text-on-surface"
          >
            Amount (BRL)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
              R$
            </span>
            <input
              id="invoice-amount"
              type="number"
              value={amountBRL}
              onChange={(e) => setAmountBRL(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full rounded-lg bg-surface-variant py-3 pl-10 pr-4 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="invoice-status"
          className="mb-1.5 block text-sm font-medium text-on-surface"
        >
          Status
        </label>
        <div className="flex gap-2">
          {(["paid", "pending"] as const).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
                status === s
                  ? "bg-primary text-on-primary"
                  : "bg-surface-variant text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label
          htmlFor="invoice-file"
          className="mb-1.5 block text-sm font-medium text-on-surface"
        >
          Invoice File (optional)
        </label>
        <input
          id="invoice-file"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary"
        />
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="invoice-notes"
          className="mb-1.5 block text-sm font-medium text-on-surface"
        >
          Notes (optional)
        </label>
        <textarea
          id="invoice-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., exchange rate, card used..."
          rows={2}
          className="w-full rounded-lg bg-surface-variant px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-error-container/30 p-3">
          <span className="material-symbols-outlined text-[18px] text-error">
            error
          </span>
          <p className="text-sm text-on-error-container">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!date || !amountBRL || saving}
          className="signature-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-on-primary shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        >
          {saving ? "Saving..." : "Save Invoice"}
        </button>
      </div>
    </div>
  );
}

function InvoiceRow({
  invoice,
  onDelete,
  isDeleting,
}: {
  invoice: Invoice;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="group flex items-center gap-4 rounded-lg bg-surface-container-low p-4 transition-colors hover:bg-surface-container">
      <Link
        to="/invoices/$id"
        params={{ id: invoice.id }}
        className="flex flex-1 items-center gap-4"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8">
          <span className="material-symbols-outlined text-[20px] text-primary">
            receipt
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-on-surface">
            {formatInvoiceDate(invoice.date)}
          </p>
          {invoice.notes && (
            <p className="text-xs text-on-surface-variant">{invoice.notes}</p>
          )}
        </div>
      </Link>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
            invoice.status === "paid"
              ? "bg-secondary/10 text-secondary"
              : "bg-tertiary-container/20 text-tertiary"
          )}
        >
          {invoice.status}
        </span>
        <p className="text-sm font-bold text-on-surface">
          {formatCurrency(invoice.amountBRL, "BRL")}
        </p>
        {invoice.fileUrl && (
          <a
            href={invoice.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-container-high"
            title={invoice.fileName ?? "View file"}
          >
            <span className="material-symbols-outlined text-[16px] text-primary">
              attachment
            </span>
          </a>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="flex h-8 w-8 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-error-container/30 group-hover:opacity-100 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px] text-error">
            {isDeleting ? "progress_activity" : "delete"}
          </span>
        </button>
      </div>
    </div>
  );
}
