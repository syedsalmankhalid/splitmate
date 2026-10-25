// Net balance per email in cents: positive = is owed, negative = owes.
// Soft-deleted expenses are always ignored; recalculated from scratch every time.
// Expenses whose splits don't add up to the total are skipped so bad data can't skew balances.
export function computeNets(expenses) {
  const nets = {}
  for (const e of expenses) {
    if (e.isDeleted) continue
    const splitTotal = e.splits.reduce((sum, s) => sum + s.cents, 0)
    if (e.splits.length === 0 || splitTotal !== e.amountCents) continue
    nets[e.paidBy] = (nets[e.paidBy] || 0) + e.amountCents
    for (const { email, cents } of e.splits) {
      nets[email] = (nets[email] || 0) - cents
    }
  }
  return nets
}

// Greedy: repeatedly match the biggest debtor with the biggest creditor.
// Yields at most (people - 1) payments.
export function computeSettlements(expenses) {
  const nets = computeNets(expenses)
  const creditors = []
  const debtors = []
  for (const [email, cents] of Object.entries(nets)) {
    if (cents > 0) creditors.push({ email, cents })
    else if (cents < 0) debtors.push({ email, cents: -cents })
  }
  const payments = []
  while (creditors.length && debtors.length) {
    creditors.sort((a, b) => b.cents - a.cents)
    debtors.sort((a, b) => b.cents - a.cents)
    const c = creditors[0]
    const d = debtors[0]
    const amount = Math.min(c.cents, d.cents)
    payments.push({ from: d.email, to: c.email, cents: amount })
    c.cents -= amount
    d.cents -= amount
    if (c.cents === 0) creditors.shift()
    if (d.cents === 0) debtors.shift()
  }
  return payments
}
