import { Link } from 'react-router-dom'
import BalanceText from '../components/BalanceText'
import { useAuth } from '../context/AuthContext'
import { getExpenses, getGroups } from '../data/storage'
import { computeNets } from '../utils/balance'
import { formatMoney } from '../utils/money'

function Stat({ label, value, color }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const groups = getGroups()
    .filter((g) => g.memberEmails.includes(user.email))
    .map((g) => ({ ...g, net: computeNets(getExpenses(g.id))[user.email] || 0 }))

  const owedToYou = groups.reduce((s, g) => s + Math.max(g.net, 0), 0)
  const youOwe = groups.reduce((s, g) => s + Math.max(-g.net, 0), 0)
  const net = owedToYou - youOwe

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Owed to you" value={formatMoney(owedToYou)} color="text-green-600" />
        <Stat label="You owe" value={formatMoney(youOwe)} color="text-red-600" />
        <Stat
          label="Net balance"
          value={`${net < 0 ? '-' : ''}${formatMoney(Math.abs(net))}`}
          color={net > 0 ? 'text-green-600' : net < 0 ? 'text-red-600' : 'text-gray-500'}
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h1 className="text-xl font-bold">Your groups</h1>
        {groups.length > 0 && (
          <Link to="/group/new" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            Create group
          </Link>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-gray-500">You're not in any groups yet.</p>
          <Link to="/group/new" className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700">
            Create group
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {groups.map((g) => (
            <li key={g.id}>
              <Link to={`/group/${g.id}`} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:shadow">
                <div>
                  <p className="font-semibold">{g.name}</p>
                  <p className="text-sm text-gray-500">{g.memberEmails.length} members</p>
                </div>
                <BalanceText net={g.net} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
