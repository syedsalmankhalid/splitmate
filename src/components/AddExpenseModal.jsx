import { useState } from 'react'
import { isRegistered, nameFor } from '../hooks/useNames'
import { formatMoney, splitEqually, toCents } from '../utils/money'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2'
const today = () => new Date().toISOString().slice(0, 10)

// Parses a custom amount field. Blank counts as 0; returns null if invalid.
function parseCustom(value) {
  if (value.trim() === '') return 0
  const n = parseFloat(value)
  return Number.isFinite(n) && n >= 0 ? toCents(value) : null
}

export default function AddExpenseModal({ members, currentEmail, onSave, onCancel }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today)
  const [paidBy, setPaidBy] = useState(members.includes(currentEmail) ? currentEmail : members[0])
  const [splitType, setSplitType] = useState('equal')
  const [sharedWith, setSharedWith] = useState(members) // equal mode: all selected by default
  const [customAmounts, setCustomAmounts] = useState({}) // custom mode: email -> input string
  const [customTouched, setCustomTouched] = useState(false)
  const [error, setError] = useState('')

  const cents = parseFloat(amount) > 0 ? toCents(amount) : 0
  const sharers = members.filter((m) => sharedWith.includes(m))
  const equalShares = splitEqually(cents, sharers.length)

  const customCents = members.map((m) => parseCustom(customAmounts[m] ?? ''))
  const customValid = customCents.every((c) => c !== null)
  const assigned = customCents.reduce((sum, c) => sum + (c || 0), 0)
  const remaining = cents - assigned

  function switchTo(type) {
    if (type === splitType) return
    // First time in custom mode: start from the current equal split instead of blanks.
    if (type === 'custom' && !customTouched) {
      const prefill = {}
      sharers.forEach((m, i) => { prefill[m] = (equalShares[i] / 100).toFixed(2) })
      setCustomAmounts(prefill)
    }
    setSplitType(type)
    setError('')
  }

  function setCustom(email, value) {
    setCustomTouched(true)
    setCustomAmounts({ ...customAmounts, [email]: value })
  }

  function fillRemainder(email, current) {
    setCustom(email, (((current || 0) + remaining) / 100).toFixed(2))
  }

  function toggle(email) {
    setSharedWith(sharedWith.includes(email) ? sharedWith.filter((m) => m !== email) : [...sharedWith, email])
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) return setError('Describe what it was for.')
    if (!cents) return setError('Enter an amount greater than 0.')

    let splits
    if (splitType === 'equal') {
      if (sharers.length === 0) return setError('Pick at least one person to share it.')
      splits = sharers.map((email, i) => ({ email, cents: equalShares[i] }))
    } else {
      if (!customValid) return setError('Custom amounts must be numbers of 0 or more.')
      if (remaining !== 0) {
        return setError(
          remaining > 0
            ? `${formatMoney(remaining)} still unassigned.`
            : `Amounts are ${formatMoney(-remaining)} over the total.`,
        )
      }
      splits = members.flatMap((email, i) => (customCents[i] > 0 ? [{ email, cents: customCents[i] }] : []))
    }
    onSave({ description: description.trim(), amountCents: cents, date, paidBy, splitType, splits })
  }

  const tabClass = (type) =>
    `flex-1 rounded-md py-1.5 text-sm ${splitType === type ? 'bg-white font-medium shadow-sm' : 'text-gray-500'}`

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4" onClick={onCancel}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-xl font-bold">Add expense</h2>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        <input className={inputClass} placeholder="What was it for?" value={description} onChange={(e) => setDescription(e.target.value)} autoFocus />
        <div className="grid grid-cols-2 gap-3">
          <input className={inputClass} type="number" min="0" step="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <label className="block text-sm text-gray-600">
          Paid by
          <select className={`${inputClass} mt-1`} value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            {members.map((m) => (
              <option key={m} value={m}>{nameFor(m)}{!isRegistered(m) ? ' (pending)' : ''}</option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="text-sm text-gray-600">Split</legend>
          <div className="mt-2 flex gap-1 rounded-lg bg-gray-100 p-1">
            <button type="button" className={tabClass('equal')} onClick={() => switchTo('equal')}>Equal</button>
            <button type="button" className={tabClass('custom')} onClick={() => switchTo('custom')}>Custom</button>
          </div>

          {splitType === 'equal' ? (
            <ul className="mt-3 space-y-2">
              {members.map((m) => {
                const idx = sharers.indexOf(m)
                return (
                  <li key={m} className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={sharedWith.includes(m)} onChange={() => toggle(m)} />
                      {nameFor(m)}
                    </label>
                    <span className="text-sm text-gray-500">{idx >= 0 ? formatMoney(equalShares[idx]) : '—'}</span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <>
              <ul className="mt-3 space-y-2">
                {members.map((m, i) => (
                  <li key={m} className="flex items-center justify-between gap-2">
                    <span>{nameFor(m)}</span>
                    <span className="flex items-center gap-2">
                      {remaining !== 0 && cents > 0 && (customCents[i] || 0) + remaining >= 0 && (
                        <button type="button" onClick={() => fillRemainder(m, customCents[i])} className="text-xs text-emerald-600 hover:underline">
                          Fill remainder
                        </button>
                      )}
                      <input
                        className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-right"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={customAmounts[m] ?? ''}
                        onChange={(e) => setCustom(m, e.target.value)}
                      />
                    </span>
                  </li>
                ))}
              </ul>
              <p className={`mt-3 text-sm ${remaining === 0 && cents > 0 ? 'text-green-600' : 'text-red-600'}`}>
                Assigned {formatMoney(assigned)} of {formatMoney(cents)}
                {remaining > 0 && ` · ${formatMoney(remaining)} left`}
                {remaining < 0 && ` · ${formatMoney(-remaining)} over`}
              </p>
            </>
          )}
        </fieldset>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">Cancel</button>
          <button className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700">Save</button>
        </div>
      </form>
    </div>
  )
}
