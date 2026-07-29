import React from 'react'
import ThemeToggle from './ThemeToggle.jsx'

export default function Navbar({ activeTab, setActiveTab, currentUser, onOpenProfile, onLogout }) {
  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-black/10 dark:border-white/10 bg-white dark:bg-black px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('feed')}>
          <span className="h-2.5 w-2.5 rounded-full bg-phosphor" />
          <span className="font-display text-lg font-bold tracking-tight">GyChat</span>
        </div>

        <nav className="flex items-center gap-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('feed')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              activeTab === 'feed'
                ? 'bg-black text-white dark:bg-phosphor dark:text-black'
                : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            Coder Feed
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-black text-white dark:bg-phosphor dark:text-black'
                : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            Direct Messages
          </button>

          {currentUser?.is_admin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'admin'
                  ? 'bg-black text-white dark:bg-phosphor dark:text-black'
                  : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              Admin Panel
            </button>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {currentUser?.top_platform_name && currentUser?.top_platform_url && (
          <a
            href={currentUser.top_platform_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 rounded-full border border-phosphor/40 bg-phosphor/10 px-2.5 py-1 font-mono text-xs text-phosphor-deep dark:text-phosphor hover:underline"
          >
            {currentUser.top_platform_name}
            {currentUser.top_platform_handle ? `: ${currentUser.top_platform_handle}` : ''}
          </a>
        )}

        <button
          onClick={onOpenProfile}
          className="focus-ring rounded-lg border border-black/15 dark:border-white/20 px-3 py-1.5 font-mono text-xs opacity-80 hover:opacity-100"
        >
          {currentUser?.username || 'Profile'}
        </button>

        <ThemeToggle />

        <button
          onClick={onLogout}
          className="focus-ring rounded-lg border border-black/15 dark:border-white/20 px-3 py-1.5 font-mono text-xs opacity-60 hover:opacity-100"
        >
          Log out
        </button>
      </div>
    </header>
  )
}
