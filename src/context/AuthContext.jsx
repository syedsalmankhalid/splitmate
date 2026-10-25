import { createContext, useContext, useState } from 'react'
import {
  addUser,
  clearSession,
  findUserByEmail,
  findUserById,
  getSessionUserId,
  seedIfNeeded,
  setSessionUserId,
} from '../data/storage'

const AuthContext = createContext(null)

function loadSessionUser() {
  seedIfNeeded()
  const id = getSessionUserId()
  return id ? findUserById(id) : null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSessionUser)

  // Each returns { error } on failure, {} on success.
  function login(email, password) {
    const found = findUserByEmail(email)
    if (!found || found.password !== password) return { error: 'Invalid email or password.' }
    setSessionUserId(found.id)
    setUser(found)
    return {}
  }

  function register(name, email, password) {
    if (!name.trim() || !email.trim() || !password) return { error: 'All fields are required.' }
    if (findUserByEmail(email)) return { error: 'An account with this email already exists.' }
    const created = addUser({ name, email, password })
    setSessionUserId(created.id)
    setUser(created)
    return {}
  }

  function logout() {
    clearSession()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
