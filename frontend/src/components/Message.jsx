function formatTime(timestamp) {
  if (!timestamp) return ''
  try {
    const d = new Date(timestamp)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

// msg shape: { id, sender_id, receiver_id, message, timestamp }
export default function Message({ msg, isOwn }) {
  return (
    <div className={`flex w-full animate-rise ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`group relative max-w-[75%] rounded-2xl px-4 py-2.5 text-[0.925rem] leading-relaxed shadow-sm
          ${
            isOwn
              ? 'bg-black text-white dark:bg-phosphor dark:text-black rounded-br-sm'
              : 'bg-black/5 text-black dark:bg-white/10 dark:text-white rounded-bl-sm border border-black/5 dark:border-white/10'
          }`}
      >
        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
        <span
          className={`mt-1 block font-mono text-[0.65rem] tracking-wide opacity-50
            ${isOwn ? 'text-right' : 'text-left'}`}
        >
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </div>
  )
}
