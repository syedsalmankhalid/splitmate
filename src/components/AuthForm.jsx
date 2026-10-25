import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none'

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register'
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) return <Navigate to="/dashboard" replace />

  function handleSubmit(e) {
    e.preventDefault()
    const result = isRegister ? register(name, email, password) : login(email, password)
    if (result.error) setError(result.error)
    else navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        {isRegister && (
          <input className={inputClass} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input className={inputClass} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={inputClass} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full rounded-lg bg-emerald-600 py-2 font-medium text-white hover:bg-emerald-700">
          {isRegister ? 'Register' : 'Log in'}
        </button>
        <p className="text-center text-sm text-gray-500">
          {isRegister ? (
            <>Already have an account? <Link to="/login" className="text-emerald-600">Sign in</Link></>
          ) : (
            <>New here? <Link to="/register" className="text-emerald-600">Create an account</Link></>
          )}
        </p>
      </form>
    </div>
  )
}
