import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [form, setForm] = useState({})
  const [keyInput, setKeyInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [authPassed, setAuthPassed] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        console.error(error)
        setError('Post not found.')
      } else {
        setPost(data)
        setForm({
          title: data.title || '',
          content: data.content || '',
          image_url: data.image_url || '',
          video_url: data.video_url || '',
          tags: data.tags || '',
        })
      }

      setLoading(false)
    }

    fetchPost()
  }, [id])

  const handleKeySubmit = (e) => {
    e.preventDefault()
    if (keyInput === post?.secret_key) {
      setAuthPassed(true)
      setError('')
    } else {
      setError('Incorrect secret key. Access denied.')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    const { error } = await supabase
      .from('posts')
      .update(form)
      .eq('id', id)

    if (error) {
      alert('Failed to update post.')
    } else {
      navigate('/')
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this post?')
    if (!confirmed) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Failed to delete post.')
    } else {
      navigate('/')
    }
  }

  if (loading) return <div className="page"><p>Loading post...</p></div>

  return (
    <div className="page">
      <h2>Edit Post</h2>

      {!authPassed ? (
        <form onSubmit={handleKeySubmit} className="post-form">
          <label>
            Enter Secret Key:
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit">Verify</button>
        </form>
      ) : (
        <form onSubmit={handleUpdate} className="post-form">
          <label>
            Title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Content
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={4}
            />
          </label>

          <label>
            Image URL
            <input
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
            />
          </label>

          <label>
            Video URL
            <input
              name="video_url"
              value={form.video_url}
              onChange={handleChange}
            />
          </label>

          <label>
            Tags
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
            />
          </label>

          <button type="submit">Save Changes</button>
          <button
            type="button"
            onClick={handleDelete}
            style={{
              marginLeft: '10px',
              backgroundColor: '#912f2f',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Delete Post
          </button>
        </form>
      )}
    </div>
  )
}
