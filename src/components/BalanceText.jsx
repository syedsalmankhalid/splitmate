import { formatMoney } from '../utils/money'

// Balance from the current user's perspective, coloured green / red / gray.
export default function BalanceText({ net }) {
  if (net > 0) return <span className="font-medium text-green-600">You're owed {formatMoney(net)}</span>
  if (net < 0) return <span className="font-medium text-red-600">You owe {formatMoney(-net)}</span>
  return <span className="text-gray-400">All settled</span>
}
