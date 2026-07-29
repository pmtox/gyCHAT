import { useEffect, useState } from 'react'
import api from '../api/axios.js'

export default function Sidebar({ contacts, activeId, onSelect, onAddContact, currentUser }) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!search.trim()) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(search.trim())}`)
        setResults(data)
      } catch (err) {
        console.error('Failed to search users', err)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timeout)
  }, [search])

  function handleSelect(user) {
    onAddContact(user)
    onSelect(user)
    setSearch('')
    setResults([])
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
        <div className="mb-3 px-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username"
            className="focus-ring w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm outline-none dark:border-white/10"
          />
          {loading && <p className="mt-2 text-[0.7rem] opacity-50">Searching…</p>}
          {!loading && results.length > 0 && (
            <div className="mt-2 space-y-1 rounded-xl border border-black/10 bg-white/70 p-2 shadow-sm dark:border-white/10 dark:bg-black/70">
              {results.filter((user) => user.id !== currentUser?.id).map((user) => (
                <button key={user.id} onClick={() => handleSelect(user)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10">
                  <span>{user.username}</span>
                  <span className="text-[0.7rem] opacity-50">Open chat</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {contacts.length === 0 && (
          <p className="px-2 py-6 text-sm opacity-50">Search for a username to start chatting.</p>
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

    </aside>
  )
}
