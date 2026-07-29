import { useState } from 'react'

// The backend contract doesn't expose a "list users" endpoint, so contacts are
// added locally by id/username and persisted in localStorage per logged-in user.
export default function Sidebar({ contacts, activeId, onSelect, onAddContact, currentUser }) {
  const [showForm, setShowForm] = useState(false)
  const [newId, setNewId] = useState('')
  const [newName, setNewName] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (!newId || !newName) return
    onAddContact({ id: Number(newId), username: newName })
    setNewId('')
    setNewName('')
    setShowForm(false)
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-black/10 dark:border-white/10 bg-white dark:bg-black">
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-phosphor animate-pulseRing" />
          <h1 className="font-display text-lg font-semibold tracking-tight">GyChat</h1>
        </div>
      </div>

      <div className="px-5 pb-3">
        <p className="font-mono text-[0.68rem] uppercase tracking-widest opacity-40">
          Signed in as {currentUser?.username || 'you'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        {contacts.length === 0 && (
          <p className="px-2 py-6 text-sm opacity-50">
            No contacts yet. Add someone by their user id to start chatting.
          </p>
        )}
        <ul className="space-y-1">
          {contacts.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c)}
                className={`focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors
                  ${
                    activeId === c.id
                      ? 'bg-black text-white dark:bg-phosphor dark:text-black'
                      : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
              >
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 font-display text-sm font-medium">
                  {c.username?.[0]?.toUpperCase() || '?'}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-phosphor ring-2 ring-white dark:ring-black" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{c.username}</span>
                  <span className="block truncate font-mono text-[0.68rem] opacity-50">id · {c.id}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-black/10 dark:border-white/10 p-4">
        {showForm ? (
          <form onSubmit={handleAdd} className="space-y-2 animate-rise">
            <input
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="User id"
              inputMode="numeric"
              className="focus-ring w-full rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Display name"
              className="focus-ring w-full rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="focus-ring flex-1 rounded-lg bg-phosphor px-3 py-2 text-sm font-medium text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="focus-ring rounded-lg border border-black/15 dark:border-white/20 px-3 py-2 text-sm opacity-70 hover:opacity-100"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-black/20 dark:border-white/25 px-3 py-2.5 text-sm font-medium opacity-70 transition-opacity hover:opacity-100"
          >
            + Add contact
          </button>
        )}
      </div>
    </aside>
  )
}
