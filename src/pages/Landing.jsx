import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  ['Create groups', 'Set up a group for a trip, a flat or a night out and invite people by email.'],
  ['Track shared expenses', 'Log who paid and who shared it. Splits are calculated for you.'],
  ['See who owes what', 'Debts are simplified into the fewest payments needed to settle up.'],
]

export default function Landing() {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">Split expenses, not friendships.</h1>
        <p className="mt-4 text-lg text-gray-600">
          Splitmate keeps track of shared costs so everyone knows exactly where they stand.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to="/register" className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700">
            Get started
          </Link>
          <Link to="/login" className="text-emerald-700 hover:underline">Sign in</Link>
        </div>
        <div className="mt-16 grid gap-6 text-left sm:grid-cols-3">
          {features.map(([title, text]) => (
            <div key={title} className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
