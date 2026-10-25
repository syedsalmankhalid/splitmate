import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="text-lg font-bold text-emerald-600">Splitmate</Link>
        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">{user.name}</span>
            <button
              onClick={() => { logout(); navigate('/') }}
              className="cursor-pointer text-gray-500 hover:text-gray-900"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
