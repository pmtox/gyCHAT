import { useEffect, useState } from 'react'
import api from '../api/axios.js'

export default function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
    } catch (err) {
      console.error('Failed to load admin data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function toggleAdmin(userId) {
    try {
      const { data } = await api.post(`/admin/users/${userId}/toggle-admin`)
      setUsers((prev) => prev.map((user) => user.id === userId ? { ...user, is_admin: data.is_admin } : user))
    } catch (err) {
      console.error('Failed to update admin status', err)
    }
  }

  if (loading) {
    return <div className="p-6 text-sm opacity-60">Loading admin dashboard...</div>
  }

  return (
    <div className="h-full overflow-y-auto bg-white/80 p-6 dark:bg-black/80">
      <div className="mb-6">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] opacity-50">Admin panel</p>
        <h2 className="text-2xl font-semibold">System monitoring and user management</h2>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {[
          ['Users', stats?.total_users ?? 0],
          ['Messages', stats?.total_messages ?? 0],
          ['Posts', stats?.total_posts ?? 0],
          ['Comments', stats?.total_comments ?? 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-black/10 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] opacity-50">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-black/10 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Registered users</h3>
          <button onClick={loadData} className="rounded-full border border-black/10 px-3 py-1 text-sm dark:border-white/10">Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-[0.72rem] uppercase tracking-[0.2em] opacity-50 dark:border-white/10">
                <th className="px-2 py-2">ID</th>
                <th className="px-2 py-2">Username</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Joined</th>
                <th className="px-2 py-2">Admin</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-black/10 dark:border-white/10">
                  <td className="px-2 py-2">{user.id}</td>
                  <td className="px-2 py-2">{user.username}</td>
                  <td className="px-2 py-2">{user.email}</td>
                  <td className="px-2 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-2 py-2">
                    <button onClick={() => toggleAdmin(user.id)} className={`rounded-full px-3 py-1 text-xs font-medium ${user.is_admin ? 'bg-phosphor text-black' : 'border border-black/10 dark:border-white/10'}`}>
                      {user.is_admin ? 'Admin' : 'Member'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
