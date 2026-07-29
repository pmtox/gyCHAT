import { useEffect, useState } from 'react'
import api from '../api/axios.js'

export default function ProfileModal({ currentUser, onClose, onUpdated }) {
  const [form, setForm] = useState({
    bio: currentUser?.bio || '',
    top_platform_name: currentUser?.top_platform_name || '',
    top_platform_handle: currentUser?.top_platform_handle || '',
    top_platform_url: currentUser?.top_platform_url || '',
    skills: currentUser?.skills || '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      bio: currentUser?.bio || '',
      top_platform_name: currentUser?.top_platform_name || '',
      top_platform_handle: currentUser?.top_platform_handle || '',
      top_platform_url: currentUser?.top_platform_url || '',
      skills: currentUser?.skills || '',
    })
  }, [currentUser])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/users/profile/me', form)
      onUpdated?.(data)
      onClose()
    } catch (err) {
      console.error('Failed to save profile', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-black">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] opacity-50">Profile editor</p>
            <h3 className="text-xl font-semibold">Shape your developer identity</h3>
          </div>
          <button onClick={onClose} className="rounded-full border border-black/10 px-3 py-1 text-sm dark:border-white/10">Close</button>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <textarea value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} rows={4} placeholder="Write a short bio..." className="focus-ring w-full rounded-2xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none dark:border-white/10" />
          <div className="grid gap-3 md:grid-cols-2">
            <input value={form.top_platform_name} onChange={(e) => setForm((prev) => ({ ...prev, top_platform_name: e.target.value }))} placeholder="Platform name" className="focus-ring w-full rounded-2xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none dark:border-white/10" />
            <input value={form.top_platform_handle} onChange={(e) => setForm((prev) => ({ ...prev, top_platform_handle: e.target.value }))} placeholder="Platform handle" className="focus-ring w-full rounded-2xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none dark:border-white/10" />
          </div>
          <input value={form.top_platform_url} onChange={(e) => setForm((prev) => ({ ...prev, top_platform_url: e.target.value }))} placeholder="Profile URL" className="focus-ring w-full rounded-2xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none dark:border-white/10" />
          <input value={form.skills} onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))} placeholder="Skills: Python, DSA, Graphs" className="focus-ring w-full rounded-2xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none dark:border-white/10" />
          <button type="submit" disabled={saving} className="rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-phosphor dark:text-black">
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
