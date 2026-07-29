import { createContext, useContext, useState } from 'react'
import api from '../api/axios.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('gychat_token'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('gychat_user')
    return raw ? JSON.parse(raw) : null
  })

  // Calls POST /auth/register exactly as defined by the backend contract.
  async function register({ username, email, password }) {
    const { data } = await api.post('/auth/register', { username, email, password })
    return data // { id, username, email }
  }

  // /auth/login uses FastAPI's OAuth2PasswordRequestForm, which requires
  // form-urlencoded data with a "username" field (holding the email) and
  // "password" — NOT a JSON body. Sending JSON here is what causes a 422.
  async function login({ email, password }) {
    const body = new URLSearchParams()
    body.set('username', email)
    body.set('password', password)

    const { data } = await api.post('/auth/login', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    localStorage.setItem('gychat_token', data.access_token)
    setToken(data.access_token)

    const me = await api.get('/users/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    })
    setSessionUser(me.data)

    return data
  }

  async function googleRegister({ credential, username, password }) {
    const { data } = await api.post('/auth/google/register', { credential, username, password })
    localStorage.setItem('gychat_token', data.access_token)
    setToken(data.access_token)

    const me = await api.get('/users/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    })
    setSessionUser(me.data)

    return data
  }

  function setSessionUser(u) {
    localStorage.setItem('gychat_user', JSON.stringify(u))
    setUser(u)
  }

  function logout() {
    localStorage.removeItem('gychat_token')
    localStorage.removeItem('gychat_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ token, user, register, login, googleRegister, logout, setSessionUser, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
