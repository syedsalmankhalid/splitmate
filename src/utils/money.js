export const toCents = (value) => Math.round(parseFloat(value) * 100)

export function formatMoney(cents) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

// Splits cents across n people; leftover cents go to the first few so the total is exact.
export function splitEqually(totalCents, n) {
  if (n === 0) return []
  const base = Math.floor(totalCents / n)
  const extra = totalCents - base * n
  return Array.from({ length: n }, (_, i) => base + (i < extra ? 1 : 0))
}
