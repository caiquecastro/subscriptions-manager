export const SUPPORTED_CURRENCIES = ["BRL", "USD", "EUR"] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

const currencyConfig: Record<Currency, { locale: string; symbol: string }> = {
  BRL: { locale: "pt-BR", symbol: "R$" },
  USD: { locale: "en-US", symbol: "$" },
  EUR: { locale: "de-DE", symbol: "€" },
};

export const DEFAULT_CURRENCY: Currency = "BRL";

export function formatCurrency(
  amount: number,
  currency: Currency = DEFAULT_CURRENCY
): string {
  const resolved = currencyConfig[currency] ? currency : DEFAULT_CURRENCY;
  const { locale } = currencyConfig[resolved];
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: resolved,
  }).format(amount);
}

export function getCurrencySymbol(
  currency: Currency = DEFAULT_CURRENCY
): string {
  return (
    currencyConfig[currency]?.symbol ?? currencyConfig[DEFAULT_CURRENCY].symbol
  );
}
