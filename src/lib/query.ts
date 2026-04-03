import { QueryClient, queryOptions } from "@tanstack/react-query";
import { getBalances, getInvoices, getSubscriptions } from "./firebase";

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

export function subscriptionInvoicesQueryOptions(subscriptionId: string) {
  return queryOptions({
    queryKey: ["invoices", subscriptionId],
    queryFn: () => getInvoices(subscriptionId),
  });
}
