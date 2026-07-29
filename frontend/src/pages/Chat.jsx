import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { connectSocket, disconnectSocket, onMessage, sendMessage, isConnected } from '../websocket/socket.js'
import api from '../api/axios.js'
import Sidebar from '../components/Sidebar.jsx'
import ChatWindow from '../components/ChatWindow.jsx'
import Navbar from '../components/Navbar.jsx'
import Feed from '../components/Feed.jsx'
import AdminPanel from '../components/AdminPanel.jsx'
import ProfileModal from '../components/ProfileModal.jsx'

export default function Chat() {
  const { user, token, logout, setSessionUser } = useAuth()
  const navigate = useNavigate()

  const [contacts, setContacts] = useState([])
  const [active, setActive] = useState(null)
  const [threads, setThreads] = useState({})
  const [connected, setConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('feed')
  const [showProfile, setShowProfile] = useState(false)

  const fetchContacts = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data } = await api.get('/users')
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
      const otherId = incoming.sender_id === user.id ? incoming.receiver_id : incoming.sender_id
      setThreads((prev) => ({
        ...prev,
        [otherId]: [...(prev[otherId] || []), incoming],
      }))
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

  useEffect(() => {
    if (!active?.id || !user?.id) return
    let cancelled = false

    api.get(`/messages/${active.id}`)
      .then(({ data }) => {
        if (cancelled) return
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

  const handleAddContact = useCallback((contact) => {
    setContacts((prev) => {
      if (prev.some((c) => c.id === contact.id)) return prev
      return [...prev, contact]
    })
  }, [])

  const handleSend = useCallback((text) => {
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
  }, [active, user])

  const handleMessageAuthor = useCallback((profile) => {
    setActiveTab('chat')
    const existing = contacts.find((contact) => contact.id === profile.id)
    if (existing) {
      setActive(existing)
      return
    }
    handleAddContact(profile)
    setActive(profile)
  }, [contacts, handleAddContact])

  const handleProfileUpdated = useCallback((updatedUser) => {
    setSessionUser(updatedUser)
  }, [setSessionUser])

  if (!user?.id) return null

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white dark:bg-black">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={user} onOpenProfile={() => setShowProfile(true)} onLogout={() => { disconnectSocket(); logout(); navigate('/login') }} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="w-[300px] shrink-0 border-r border-black/10 dark:border-white/10">
          <Sidebar
            contacts={contacts}
            activeId={active?.id}
            onSelect={setActive}
            onAddContact={handleAddContact}
            currentUser={user}
          />
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'feed' && <Feed currentUser={user} onMessageAuthor={handleMessageAuthor} />}
          {activeTab === 'chat' && (
            <ChatWindow
              activeContact={active}
              messages={active ? threads[active.id] || [] : []}
              onSend={handleSend}
              currentUserId={user.id}
              connected={connected}
            />
          )}
          {activeTab === 'admin' && user?.is_admin && <AdminPanel />}
        </div>
      </div>

      {showProfile && (
        <ProfileModal currentUser={user} onClose={() => setShowProfile(false)} onUpdated={handleProfileUpdated} />
      )}
    </div>
  )
}
