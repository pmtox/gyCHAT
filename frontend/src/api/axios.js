import axios from 'axios'

// Base URL can be overridden in Netlify/Vite env vars for production deployments.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach the stored JWT to every outgoing request, if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gychat_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
