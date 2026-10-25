// The only module that touches localStorage. Everything else goes through here.
import { splitEqually } from '../utils/money'

const KEYS = {
  users: 'splitmate_users',
  groups: 'splitmate_groups',
  expenses: 'splitmate_expenses',
  session: 'splitmate_session',
}

const SEED_USERS = [
  { id: 'u-shubham', name: 'Shubham', email: 'shubham@test.com', password: 'password' },
  { id: 'u-bob', name: 'Bob', email: 'bob@test.com', password: 'password' },
  { id: 'u-rahul', name: 'Rahul', email: 'rahul@test.com', password: 'password' },
  { id: 'u-eva', name: 'Eva', email: 'eva@test.com', password: 'password' },
]

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const normalizeEmail = (email) => email.trim().toLowerCase()

// Seed test accounts on first load (only if no users exist yet).
export function seedIfNeeded() {
  if (localStorage.getItem(KEYS.users) === null) write(KEYS.users, SEED_USERS)
}

// Users
export const getUsers = () => read(KEYS.users, [])

export function findUserByEmail(email) {
  const e = normalizeEmail(email)
  return getUsers().find((u) => u.email === e) || null
}

export function findUserById(id) {
  return getUsers().find((u) => u.id === id) || null
}

export function addUser({ name, email, password }) {
  const user = { id: newId('u'), name: name.trim(), email: normalizeEmail(email), password }
  write(KEYS.users, [...getUsers(), user])
  return user
}

// Session
export const getSessionUserId = () => read(KEYS.session, null)
export const setSessionUserId = (id) => write(KEYS.session, id)
export const clearSession = () => localStorage.removeItem(KEYS.session)

// Groups: { id, name, createdBy (email), memberEmails: [email], createdAt }
// Member status (active/pending) is derived from whether the email is a registered user,
// so pending members become active automatically once they register.
export const getGroups = () => read(KEYS.groups, [])
export const getGroup = (id) => getGroups().find((g) => g.id === id) || null

export function addGroup({ name, createdBy, memberEmails }) {
  const group = {
    id: newId('g'),
    name: name.trim(),
    createdBy,
    memberEmails,
    createdAt: new Date().toISOString(),
  }
  write(KEYS.groups, [...getGroups(), group])
  return group
}

// Expenses: { id, groupId, description, amountCents, date, paidBy (email),
//             splitType: 'equal' | 'custom', splits: [{ email, cents }], isDeleted }
// Older records only have sharedWith (always an equal split); convert them on read.
function withSplits(expense) {
  if (expense.splits) return expense
  const shares = splitEqually(expense.amountCents, expense.sharedWith.length)
  return {
    ...expense,
    splitType: 'equal',
    splits: expense.sharedWith.map((email, i) => ({ email, cents: shares[i] })),
  }
}

export const getExpenses = (groupId) =>
  read(KEYS.expenses, []).filter((e) => e.groupId === groupId).map(withSplits)

export function addExpense(data) {
  const expense = { id: newId('e'), ...data, isDeleted: false, createdAt: new Date().toISOString() }
  write(KEYS.expenses, [...read(KEYS.expenses, []), expense])
  return expense
}

// Soft delete: the record is kept, just flagged.
export function softDeleteExpense(id) {
  write(
    KEYS.expenses,
    read(KEYS.expenses, []).map((e) => (e.id === id ? { ...e, isDeleted: true } : e)),
  )
}
