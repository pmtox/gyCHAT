import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/chat')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="texture-grid relative flex h-full min-h-screen items-center justify-center bg-white dark:bg-black px-4">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm animate-rise">
        <div className="mb-8 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-phosphor animate-pulseRing" />
          <h1 className="font-display text-2xl font-semibold tracking-tight">GyChat</h1>
        </div>

        <p className="mb-6 text-sm opacity-60">Log in to continue your conversations.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="focus-ring w-full rounded-xl border border-black/15 dark:border-white/20 bg-transparent px-4 py-3 text-sm outline-none placeholder:opacity-40"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="focus-ring w-full rounded-xl border border-black/15 dark:border-white/20 bg-transparent px-4 py-3 text-sm outline-none placeholder:opacity-40"
          />

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring w-full rounded-xl bg-black py-3 text-sm font-medium text-white transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 dark:bg-phosphor dark:text-black"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm opacity-60">
          New here?{' '}
          <Link to="/register" className="font-medium text-phosphor-deep dark:text-phosphor underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
