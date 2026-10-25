import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { addGroup, normalizeEmail } from '../data/storage'
import { isRegistered, nameFor } from '../hooks/useNames'

export default function CreateGroup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [members, setMembers] = useState([user.email]) // creator is added automatically
  const [error, setError] = useState('')

  function addMember() {
    const email = normalizeEmail(emailInput)
    if (!email) return
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    if (members.includes(email)) return setError('That person is already in the group.')
    setMembers([...members, email])
    setEmailInput('')
    setError('')
  }

  function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) return setError('Give the group a name.')
    const group = addGroup({ name, createdBy: user.email, memberEmails: members })
    navigate(`/group/${group.id}`)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <h1 className="text-2xl font-bold">Create group</h1>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      <input
        className="w-full rounded-lg border border-gray-300 px-3 py-2"
        placeholder="Group name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
            type="email"
            placeholder="Add member by email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMember() } }}
          />
          <button type="button" onClick={addMember} className="rounded-lg border border-gray-300 px-4 hover:bg-gray-100">
            Add
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {members.map((email) => (
            <li key={email} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
              <span>
                {nameFor(email)} <span className="text-sm text-gray-400">{email}</span>
                {email === user.email && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                {!isRegistered(email) && (
                  <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">pending</span>
                )}
              </span>
              {email !== user.email && (
                <button type="button" onClick={() => setMembers(members.filter((m) => m !== email))} className="text-sm text-gray-400 hover:text-red-600">
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <button className="rounded-lg bg-emerald-600 px-5 py-2 font-medium text-white hover:bg-emerald-700">
        Save group
      </button>
    </form>
  )
}
