const pkrFormatter = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return pkrFormatter.format(amount);
}
