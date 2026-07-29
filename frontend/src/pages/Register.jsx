import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function Register() {
  const { googleRegister } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleStep, setGoogleStep] = useState(false)
  const [googleCredential, setGoogleCredential] = useState('')

  async function handleGoogleCredentialResponse(response) {
    setError('')
    setGoogleCredential(response.credential)
    setGoogleStep(true)
  }

  async function handleGoogleFinalize(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await googleRegister({ credential: googleCredential, username: form.username, password: form.password })
      navigate('/chat')
    } catch (err) {
      console.error('Google register error:', err?.response?.data || err)
      setError(err?.response?.data?.detail || 'Google registration failed.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return
    const scriptId = 'google-gsi-script-register'
    if (document.getElementById(scriptId)) {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        })
        const container = document.getElementById('google-register-btn')
        if (container) {
          window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: '100%' })
        }
      }
      return
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        })
        const container = document.getElementById('google-register-btn')
        if (container) {
          window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: '100%' })
        }
      }
    }
    document.body.appendChild(script)
  }, [])

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

        <p className="mb-6 text-sm opacity-60">Create your GyChat-specific account.</p>

        {googleStep ? (
          <form onSubmit={handleGoogleFinalize} className="space-y-3">
            <input
              required
              placeholder="Choose a unique username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="focus-ring w-full rounded-xl border border-black/15 dark:border-white/20 bg-transparent px-4 py-3 text-sm outline-none placeholder:opacity-40"
            />
            <input
              type="password"
              required
              placeholder="Choose a password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="focus-ring w-full rounded-xl border border-black/15 dark:border-white/20 bg-transparent px-4 py-3 text-sm outline-none placeholder:opacity-40"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="focus-ring w-full rounded-xl bg-black py-3 text-sm font-medium text-white transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 dark:bg-phosphor dark:text-black">
              {loading ? 'Creating account…' : 'Finish signup'}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="mb-3 text-sm opacity-70">Sign in with Google to create your account, then choose a username and password.</p>
            <div id="google-register-btn" className="flex justify-center" />
            {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}
          </div>
        )}

        <p className="mt-6 text-center text-sm opacity-60">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-phosphor-deep dark:text-phosphor underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
