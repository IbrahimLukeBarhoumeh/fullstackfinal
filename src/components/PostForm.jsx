import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

const defaultForm = {
  title: '',
  content: '',
  image_url: '',
  video_url: '',
  tags: '',
  secret_key: '',
  repost_id: null,
}

export default function PostForm({ prefill = {}, onPostCreated }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ ...defaultForm, ...prefill })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(prev => ({ ...prev, ...prefill }))
  }, [prefill])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { title, content, image_url, video_url, tags, secret_key, repost_id } = form

    if (!title.trim()) {
      setError('Title is required.')
      setLoading(false)
      return
    }

    const parsedTags = tags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(Boolean)

    const { error: insertError } = await supabase.from('posts').insert([
      {
        title: title.trim(),
        content,
        image_url,
        video_url,
        tags: parsedTags.join(','),
        secret_key,
        upvotes: 0,
        repost_id,
      },
    ])

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
    } else {
      setForm(defaultForm)
      onPostCreated?.()
      navigate('/') // Redirect to homepage
    }
  }

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <h2>{form.repost_id ? 'Confirm Repost' : 'New Post'}</h2>

      <label>
        Title *
        <input name="title" value={form.title} onChange={handleChange} required />
      </label>

      <label>
        Content
        <textarea name="content" value={form.content} onChange={handleChange} rows={5} />
      </label>

      <label>
        Image URL
        <input name="image_url" value={form.image_url} onChange={handleChange} />
      </label>

      <label>
        Video URL
        <input name="video_url" value={form.video_url} onChange={handleChange} />
      </label>

      <label>
        Tags (comma-separated)
        <input name="tags" value={form.tags} onChange={handleChange} />
      </label>

      <label>
        Secret Key (used for editing/deleting)
        <input name="secret_key" value={form.secret_key} onChange={handleChange} />
      </label>

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  )
}
