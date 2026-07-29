import { useEffect, useRef, useState } from 'react'
import Message from './Message.jsx'

export default function ChatWindow({ activeContact, messages, onSend, currentUserId, connected }) {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeContact])

  function handleSubmit(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !activeContact) return
    onSend(text)
    setDraft('')
  }

  if (!activeContact) {
    return (
      <div className="texture-grid flex h-full flex-1 flex-col items-center justify-center gap-2 bg-white dark:bg-black">
        <span className="h-2 w-2 rounded-full bg-phosphor animate-blink" />
        <p className="font-mono text-sm opacity-40">Select a contact to start chatting</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-1 flex-col bg-white dark:bg-black">
      {/* header */}
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 font-display text-sm font-medium">
            {activeContact.username?.[0]?.toUpperCase()}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-phosphor ring-2 ring-white dark:ring-black" />
          </span>
          <div>
            <p className="text-sm font-semibold">{activeContact.username}</p>
            <p className="font-mono text-[0.68rem] opacity-50">
              {connected ? 'online · connected' : 'connecting…'}
            </p>
          </div>
        </div>
      </div>

      {/* messages */}
      <div className="texture-grid flex-1 space-y-3 overflow-y-auto px-6 py-6">
        {messages.length === 0 && (
          <p className="pt-10 text-center font-mono text-xs opacity-40">
            No messages yet — say hello 👋
          </p>
        )}
        {messages.map((m) => (
          <Message key={m.id ?? `${m.timestamp}-${m.message}`} msg={m} isOwn={m.sender_id === currentUserId} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* input */}
      <form onSubmit={handleSubmit} className="flex items-end gap-3 border-t border-black/10 dark:border-white/10 px-5 py-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          rows={1}
          placeholder="Type a message…"
          className="focus-ring max-h-32 flex-1 resize-none rounded-2xl border border-black/15 dark:border-white/20 bg-black/[0.02] dark:bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:opacity-40"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="Send message"
          className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 dark:bg-phosphor dark:text-black"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12L20 4L14 20L11 13L4 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" />
          </svg>
        </button>
      </form>
    </div>
  )
}
