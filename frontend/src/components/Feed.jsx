import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios.js'

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderMarkdownBody(content) {
  const pattern = /```([a-zA-Z0-9_-]*)\s*([\s\S]*?)```/g
  let html = ''
  let lastIndex = 0
  let match

  while ((match = pattern.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index).trim()
    if (before) {
      html += `<p>${escapeHtml(before).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}</p>`
    }
    html += `<pre class="rounded-xl bg-black/90 p-4 text-xs text-green-300 overflow-x-auto"><code>${escapeHtml(match[2].trim())}</code></pre>`
    lastIndex = match.index + match[0].length
  }

  const tail = content.slice(lastIndex).trim()
  if (tail) {
    html += `<p>${escapeHtml(tail).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}</p>`
  }

  return html
}

export default function Feed({ currentUser, onMessageAuthor }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', content: '', tags: '' })
  const [tagFilter, setTagFilter] = useState('')
  const [commentsByPost, setCommentsByPost] = useState({})
  const [commentDrafts, setCommentDrafts] = useState({})
  const [expandedPosts, setExpandedPosts] = useState({})

  const tagOptions = useMemo(() => ['DSA', 'Python', 'C++', 'Graphs', 'Dynamic Programming', 'System Design'], [])

  async function loadPosts() {
    setLoading(true)
    try {
      const url = tagFilter ? `/posts?tag=${encodeURIComponent(tagFilter)}` : '/posts'
      const { data } = await api.get(url)
      setPosts(data)
    } catch (err) {
      console.error('Failed to load feed', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [tagFilter])

  async function handleCreatePost(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return

    try {
      const { data } = await api.post('/posts', form)
      setPosts((prev) => [data, ...prev])
      setForm({ title: '', content: '', tags: '' })
    } catch (err) {
      console.error('Failed to create post', err)
    }
  }

  async function handleToggleUpvote(postId) {
    try {
      const { data } = await api.post(`/posts/${postId}/upvote`)
      setPosts((prev) => prev.map((post) => post.id === postId ? { ...post, upvotes_count: data.upvotes_count, is_upvoted_by_me: data.upvoted } : post))
    } catch (err) {
      console.error('Failed to toggle upvote', err)
    }
  }

  async function handleOpenComments(postId) {
    if (expandedPosts[postId]) {
      setExpandedPosts((prev) => ({ ...prev, [postId]: false }))
      return
    }

    try {
      const { data } = await api.get(`/posts/${postId}/comments`)
      setCommentsByPost((prev) => ({ ...prev, [postId]: data }))
      setExpandedPosts((prev) => ({ ...prev, [postId]: true }))
    } catch (err) {
      console.error('Failed to load comments', err)
    }
  }

  async function handleAddComment(postId) {
    const draft = commentDrafts[postId]?.trim()
    if (!draft) return

    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { content: draft })
      setCommentsByPost((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), data] }))
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }))
      setPosts((prev) => prev.map((post) => post.id === postId ? { ...post, comments_count: post.comments_count + 1 } : post))
    } catch (err) {
      console.error('Failed to add comment', err)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white/80 p-6 dark:bg-black/80">
      <div className="mb-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-black/10 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] opacity-50">Community feed</p>
              <h2 className="text-xl font-semibold">Share a write-up, build log, or interview insight</h2>
            </div>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-3">
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Post title"
              className="focus-ring w-full rounded-2xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none dark:border-white/10"
            />
            <textarea
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Write your markdown post. Use ```code``` blocks for snippets."
              rows={5}
              className="focus-ring w-full rounded-2xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none dark:border-white/10"
            />
            <input
              value={form.tags}
              onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="Tags: DSA, Dynamic Programming"
              className="focus-ring w-full rounded-2xl border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none dark:border-white/10"
            />
            <button type="submit" className="rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white dark:bg-phosphor dark:text-black">
              Publish to feed
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.3em] opacity-50">Browse by tag</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTagFilter('')} className={`rounded-full px-3 py-1.5 text-sm ${tagFilter === '' ? 'bg-black text-white dark:bg-phosphor dark:text-black' : 'border border-black/10 dark:border-white/10'}`}>
              All
            </button>
            {tagOptions.map((tag) => (
              <button key={tag} onClick={() => setTagFilter(tag)} className={`rounded-full px-3 py-1.5 text-sm ${tagFilter === tag ? 'bg-black text-white dark:bg-phosphor dark:text-black' : 'border border-black/10 dark:border-white/10'}`}>
                {tag}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-dashed border-black/10 p-3 text-sm opacity-70 dark:border-white/10">
            Posts support markdown, code fences, and quick DM handoff from any author card.
          </div>
        </section>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-black/10 p-4 text-sm opacity-60 dark:border-white/10">Loading feed...</div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-black/10 p-4 text-sm opacity-60 dark:border-white/10">No posts yet. Be the first to publish a build note.</div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="rounded-3xl border border-black/10 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{post.author_username}</p>
                  <p className="font-mono text-[0.7rem] opacity-50">{new Date(post.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {post.author_top_platform_name && post.author_top_platform_url && (
                    <a href={post.author_top_platform_url} target="_blank" rel="noreferrer" className="rounded-full border border-phosphor/40 bg-phosphor/10 px-2.5 py-1 text-[0.7rem] font-medium text-phosphor-deep dark:text-phosphor">
                      {post.author_top_platform_name}{post.author_top_platform_handle ? `: ${post.author_top_platform_handle}` : ''}
                    </a>
                  )}
                  <button onClick={() => onMessageAuthor({ id: post.author_id, username: post.author_username })} className="rounded-full border border-black/10 px-2.5 py-1 text-[0.7rem] font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10">
                    Message Author
                  </button>
                </div>
              </div>

              {post.author_skills && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {post.author_skills.split(',').map((skill) => skill.trim()).filter(Boolean).map((skill) => (
                    <span key={skill} className="rounded-full bg-black/5 px-2.5 py-1 text-[0.7rem] dark:bg-white/10">{skill}</span>
                  ))}
                </div>
              )}

              <h3 className="mb-2 text-lg font-semibold">{post.title}</h3>
              <div className="prose max-w-none space-y-3 text-sm leading-7 opacity-90" dangerouslySetInnerHTML={{ __html: renderMarkdownBody(post.content) }} />

              {post.tags && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                    <span key={tag} className="rounded-full border border-black/10 px-2.5 py-1 text-[0.7rem] dark:border-white/10">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-3 border-t border-black/10 pt-3 text-sm dark:border-white/10">
                <button onClick={() => handleToggleUpvote(post.id)} className={`rounded-full px-3 py-1.5 ${post.is_upvoted_by_me ? 'bg-phosphor text-black' : 'border border-black/10 dark:border-white/10'}`}>
                  ▲ {post.upvotes_count}
                </button>
                <button onClick={() => handleOpenComments(post.id)} className="rounded-full border border-black/10 px-3 py-1.5 dark:border-white/10">
                  💬 {post.comments_count}
                </button>
              </div>

              {expandedPosts[post.id] && (
                <div className="mt-4 rounded-2xl border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.04]">
                  {commentsByPost[post.id]?.length ? (
                    <div className="space-y-2">
                      {commentsByPost[post.id].map((comment) => (
                        <div key={comment.id} className="rounded-xl border border-black/10 p-2 text-sm dark:border-white/10">
                          <p className="font-medium">{comment.username}</p>
                          <p className="mt-1 opacity-80">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm opacity-60">No comments yet.</p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <input
                      value={commentDrafts[post.id] || ''}
                      onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Write a comment"
                      className="focus-ring flex-1 rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
                    />
                    <button onClick={() => handleAddComment(post.id)} className="rounded-xl bg-black px-3 py-2 text-sm font-medium text-white dark:bg-phosphor dark:text-black">
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  )
}
