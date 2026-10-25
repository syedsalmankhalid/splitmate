import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AddExpenseModal from '../components/AddExpenseModal'
import { useAuth } from '../context/AuthContext'
import { addExpense, getExpenses, getGroup, softDeleteExpense } from '../data/storage'
import { computeSettlements } from '../utils/balance'
import { isRegistered, nameFor } from '../hooks/useNames'
import { formatMoney } from '../utils/money'

function Settlement({ payment, me }) {
  const { from, to, cents } = payment
  const amount = formatMoney(cents)
  if (from === me) return <p className="text-lg font-semibold text-red-600">You owe {nameFor(to)} {amount}</p>
  if (to === me) return <p className="text-lg font-semibold text-green-600">{nameFor(from)} owes you {amount}</p>
  return <p className="text-sm text-gray-400">{nameFor(from)} owes {nameFor(to)} {amount}</p>
}

export default function GroupDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [, setVersion] = useState(0) // bump to re-read from storage
  const [showModal, setShowModal] = useState(false)

  const group = getGroup(id)
  if (!group || !group.memberEmails.includes(user.email)) {
    return (
      <div>
        <p className="text-gray-600">Group not found.</p>
        <Link to="/dashboard" className="text-emerald-600">Back to dashboard</Link>
      </div>
    )
  }

  const allExpenses = getExpenses(id)
  const expenses = allExpenses.filter((e) => !e.isDeleted).sort((a, b) => b.date.localeCompare(a.date))
  // Payments involving the current user first.
  const involvesMe = (p) => (p.from === user.email || p.to === user.email ? 0 : 1)
  const settlements = computeSettlements(allExpenses).sort((a, b) => involvesMe(a) - involvesMe(b))

  const refresh = () => setVersion((v) => v + 1)

  function handleSave(data) {
    addExpense({ groupId: id, ...data })
    setShowModal(false)
    refresh()
  }

  function handleDelete(expenseId) {
    softDeleteExpense(expenseId)
    refresh()
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/dashboard" className="text-sm text-gray-500 hover:underline">← Dashboard</Link>
        <h1 className="mt-1 text-2xl font-bold">{group.name}</h1>
        <ul className="mt-2 flex flex-wrap gap-2">
          {group.memberEmails.map((email) => (
            <li key={email} className="rounded-full bg-white px-3 py-1 text-sm shadow-sm">
              {nameFor(email)}
              {!isRegistered(email) && <span className="ml-1 text-amber-600">(pending)</span>}
            </li>
          ))}
        </ul>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Expenses</h2>
          <button onClick={() => setShowModal(true)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            Add expense
          </button>
        </div>
        {expenses.length === 0 ? (
          <p className="mt-4 text-gray-500">No expenses yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {expenses.map((e) => (
              <li key={e.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                <div>
                  <p className="font-medium">{e.description}</p>
                  <p className="text-sm text-gray-500">
                    Paid by {e.paidBy === user.email ? 'you' : nameFor(e.paidBy)} · {e.date}
                  </p>
                  <p className="text-xs text-gray-400">
                    {e.splitType === 'custom' ? 'Custom split: ' : 'Split equally: '}
                    {e.splits.map((s) => `${nameFor(s.email)} ${formatMoney(s.cents)}`).join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{formatMoney(e.amountCents)}</span>
                  <button onClick={() => handleDelete(e.id)} className="text-sm text-gray-400 hover:text-red-600">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Balances</h2>
        <div className="mt-3 space-y-2 rounded-xl bg-white p-4 shadow-sm">
          {settlements.length === 0 ? (
            <p className="text-gray-400">All settled</p>
          ) : (
            settlements.map((p) => <Settlement key={`${p.from}-${p.to}`} payment={p} me={user.email} />)
          )}
        </div>
      </section>

      {showModal && (
        <AddExpenseModal
          members={group.memberEmails}
          currentEmail={user.email}
          onSave={handleSave}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
