import { QueryClient, queryOptions } from "@tanstack/react-query";
import { getExchangeRates } from "./exchange-rates";
import {
  getBalances,
  getInvoice,
  getInvoices,
  getSubscriptions,
} from "./firebase";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
      },
    },
  });
}

export const subscriptionsQueryOptions = queryOptions({
  queryKey: ["subscriptions"],
  queryFn: getSubscriptions,
});

export const balancesQueryOptions = queryOptions({
  queryKey: ["balances"],
  queryFn: getBalances,
});

export const invoicesQueryOptions = queryOptions({
  queryKey: ["invoices"],
  queryFn: () => getInvoices(),
});

export function subscriptionInvoicesQueryOptions(subscriptionId: string) {
  return queryOptions({
    queryKey: ["invoices", subscriptionId],
    queryFn: () => getInvoices(subscriptionId),
  });
}

export function invoiceQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["invoice", id],
    queryFn: () => getInvoice(id),
  });
}

export const exchangeRatesQueryOptions = queryOptions({
  queryKey: ["exchange-rates"],
  queryFn: getExchangeRates,
  staleTime: 1000 * 60 * 60,
  gcTime: Number.POSITIVE_INFINITY,
});
