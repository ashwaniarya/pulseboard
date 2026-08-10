const countFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatCount(value: number): string {
  return countFormatter.format(value);
}

export function formatCurrencyFromCents(cents: number): string {
  return currencyFormatter.format(Math.round(cents / 100));
}

export function formatPercentValue(percent: number): string {
  const rounded = Math.round(percent * 10) / 10;
  return `${countFormatter.format(rounded)}%`;
}

export function formatSeconds(seconds: number): string {
  const wholeSeconds = Math.round(seconds);
  if (wholeSeconds < 60) {
    return `${String(wholeSeconds)}s`;
  }
  const minutes = Math.floor(wholeSeconds / 60);
  return `${String(minutes)}m ${String(wholeSeconds % 60)}s`;
}

export function formatRating(rating: number | null): string {
  if (rating === null) {
    return "—";
  }
  return `${(Math.round(rating * 10) / 10).toFixed(1)} / 5`;
}
