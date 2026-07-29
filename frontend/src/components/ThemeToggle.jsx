import { useTheme } from '../context/ThemeContext.jsx'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle pure black / pure white theme"
      aria-pressed={isDark}
      className="focus-ring group relative flex h-8 w-16 items-center rounded-full border transition-colors duration-300
        border-black/15 bg-black/5 dark:border-white/20 dark:bg-white/5"
    >
      <span
        className={`absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(.2,.8,.3,1)]
          ${isDark ? 'left-[calc(100%-1.625rem)] bg-black' : 'left-0.5 bg-white border border-black/10'}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full bg-phosphor ${isDark ? 'animate-pulseRing' : ''}`}
        />
      </span>
      <span className="sr-only">{isDark ? 'Dark mode on' : 'Light mode on'}</span>
    </button>
  )
}
