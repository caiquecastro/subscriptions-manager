import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { cn } from "../lib/cn";
import { formatCurrency } from "../lib/currency";
import { invoiceQueryOptions, subscriptionsQueryOptions } from "../lib/query";

export const Route = createFileRoute("/invoices_/$id")({
  component: InvoiceDetail,
});

function InvoiceDetail() {
  const { id } = Route.useParams();
  const { data: invoice, isLoading } = useQuery(invoiceQueryOptions(id));
  const { data: subscriptions = [] } = useQuery(subscriptionsQueryOptions);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-[32px] text-on-surface-variant">
          progress_activity
        </span>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="rise-in flex flex-col items-center justify-center gap-4 py-20">
        <span className="material-symbols-outlined text-[48px] text-on-surface-variant">
          search_off
        </span>
        <p className="text-on-surface-variant">Invoice not found</p>
        <Link
          to="/subscriptions"
          className="text-sm font-medium text-primary hover:text-primary-container"
        >
          Back to Subscriptions
        </Link>
      </div>
    );
  }

  const subscription = subscriptions.find(
    (s) => s.id === invoice.subscriptionId
  );

  return (
    <div className="rise-in mx-auto max-w-3xl space-y-6 py-4">
      {/* Back link */}
      <Link
        to="/subscriptions/$id"
        params={{ id: invoice.subscriptionId }}
        className="inline-flex items-center gap-1 text-sm font-medium text-on-surface-variant hover:text-on-surface"
      >
        <span className="material-symbols-outlined text-[18px]">
          arrow_back
        </span>
        {subscription ? `Back to ${subscription.name}` : "Back to Subscription"}
      </Link>

      {/* Invoice Info */}
      <section className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/8">
            <span className="material-symbols-outlined text-[28px] text-primary">
              receipt_long
            </span>
          </div>
          <div className="flex-1">
            <h1 className="font-headline text-2xl font-bold text-on-surface">
              {new Date(invoice.date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </h1>
            {subscription && (
              <p className="text-sm text-on-surface-variant">
                {subscription.name} &middot; {subscription.category}
              </p>
            )}
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
              invoice.status === "paid"
                ? "bg-secondary/10 text-secondary"
                : "bg-tertiary-container/20 text-tertiary"
            )}
          >
            {invoice.status}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-surface-container-low p-4">
            <p className="text-xs font-medium text-on-surface-variant">
              Amount
            </p>
            <p className="font-headline mt-1 text-xl font-bold text-on-surface">
              {formatCurrency(invoice.amountBRL, "BRL")}
            </p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-4">
            <p className="text-xs font-medium text-on-surface-variant">
              Recorded On
            </p>
            <p className="font-headline mt-1 text-xl font-bold text-on-surface">
              {new Date(invoice.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {invoice.fileUrl && (
          <a
            href={invoice.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-3 rounded-lg bg-surface-container-low p-4 transition-colors hover:bg-surface-container"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8">
              <span className="material-symbols-outlined text-[20px] text-primary">
                attachment
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium text-on-surface-variant">
                Attached File
              </p>
              <p className="truncate text-sm font-semibold text-on-surface">
                {invoice.fileName ?? "View file"}
              </p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              open_in_new
            </span>
          </a>
        )}

        {invoice.notes && (
          <div className="mt-4 rounded-lg bg-surface-container-low p-4">
            <p className="text-xs font-medium text-on-surface-variant">Notes</p>
            <p className="mt-1 text-sm text-on-surface">{invoice.notes}</p>
          </div>
        )}
      </section>
    </div>
  );
}
