import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { connectSocket, disconnectSocket, onMessage, sendMessage, isConnected } from '../websocket/socket.js'
import api from '../api/axios.js'
import Sidebar from '../components/Sidebar.jsx'
import ChatWindow from '../components/ChatWindow.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function Chat() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

  const [contacts, setContacts] = useState([])
  const [active, setActive] = useState(null)
  const [threads, setThreads] = useState({})
  const [connected, setConnected] = useState(false)

  // Fetch users list from server so contacts are identical across all browsers & sessions
  const fetchContacts = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data } = await api.get('/users')
      // data is list of { id, username, email }
      setContacts(data)
    } catch (err) {
      console.error('Failed to fetch registered users from server:', err)
    }
  }, [user])

  useEffect(() => {
    if (!user?.id) {
      navigate('/login')
      return
    }

    fetchContacts()
    connectSocket(user.id, token)
    const t = setInterval(() => setConnected(isConnected()), 500)

    const unsubscribe = onMessage((incoming) => {
      // incoming: { id, sender_id, receiver_id, message, timestamp }
      const otherId = incoming.sender_id === user.id ? incoming.receiver_id : incoming.sender_id
      setThreads((prev) => ({
        ...prev,
        [otherId]: [...(prev[otherId] || []), incoming],
      }))
      // If message is from a user not yet in contacts list, refresh contacts list
      setContacts((prev) => {
        if (!prev.some((c) => c.id === otherId)) {
          fetchContacts()
        }
        return prev
      })
    })

    return () => {
      clearInterval(t)
      unsubscribe()
      disconnectSocket()
    }
  }, [user, navigate, token, fetchContacts])

  // Fetch full conversation history from PostgreSQL when active contact changes
  useEffect(() => {
    if (!active?.id || !user?.id) return
    let cancelled = false

    api.get(`/messages/${active.id}`)
      .then(({ data }) => {
        if (cancelled) return
        // REST API returns "content", but WebSocket & Message component use "message"
        const normalized = data.map((m) => ({
          id: m.id,
          sender_id: m.sender_id,
          receiver_id: m.receiver_id,
          message: m.content,
          timestamp: m.timestamp,
        }))
        setThreads((prev) => ({
          ...prev,
          [active.id]: normalized,
        }))
      })
      .catch((err) => {
        console.error('Failed to load conversation history from database:', err)
      })

    return () => { cancelled = true }
  }, [active, user])

  const handleAddContact = useCallback(
    (contact) => {
      setContacts((prev) => {
        if (prev.some((c) => c.id === contact.id)) return prev
        return [...prev, contact]
      })
    },
    []
  )

  const handleSend = useCallback(
    (text) => {
      if (!active) return
      const sent = sendMessage(active.id, text)
      if (sent) {
        const optimistic = {
          id: `local-${Date.now()}`,
          sender_id: user.id,
          receiver_id: active.id,
          message: text,
          timestamp: new Date().toISOString(),
        }
        setThreads((prev) => ({
          ...prev,
          [active.id]: [...(prev[active.id] || []), optimistic],
        }))
      }
    },
    [active, user]
  )

  if (!user?.id) return null

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-black">
      <div className="w-[300px] shrink-0">
        <Sidebar
          contacts={contacts}
          activeId={active?.id}
          onSelect={setActive}
          onAddContact={handleAddContact}
          currentUser={user}
        />
      </div>

      <div className="relative flex flex-1 flex-col">
        <div className="absolute right-6 top-4 z-10 flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => {
              disconnectSocket()
              logout()
              navigate('/login')
            }}
            className="focus-ring rounded-full border border-black/15 dark:border-white/20 px-3 py-1.5 text-xs font-medium opacity-70 hover:opacity-100"
          >
            Log out
          </button>
        </div>

        <ChatWindow
          activeContact={active}
          messages={active ? threads[active.id] || [] : []}
          onSend={handleSend}
          currentUserId={user.id}
          connected={connected}
        />
      </div>
    </div>
  )
}
