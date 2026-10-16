export function formatSum(amount: number, numberLocale: string, currency: string): string {
  const formatted = new Intl.NumberFormat(numberLocale, {
    maximumFractionDigits: 0,
  }).format(amount)
  return `${formatted} ${currency}`
}
