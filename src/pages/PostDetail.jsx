import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPostAndComments()
  }, [id])

  const fetchPostAndComments = async () => {
    setLoading(true)

    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    const { data: commentData, error: commentError } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: false })

    if (postError || commentError) {
      console.error(postError || commentError)
      setError('Failed to load post or comments.')
    } else {
      setPost(postData)
      setComments(commentData)
    }

    setLoading(false)
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const { error } = await supabase.from('comments').insert([
      {
        post_id: id,
        content: commentText.trim(),
      },
    ])

    if (error) {
      alert('Failed to post comment.')
    } else {
      setCommentText('')
      fetchPostAndComments()
    }
  }

  if (loading) return <div className="page"><p>Loading post...</p></div>
  if (error) return <div className="page"><p className="error">{error}</p></div>

  return (
    <div className="page">
      <div className="post-card">
        <h2>{post.title}</h2>
        {post.image_url && (
          <img src={post.image_url} alt={post.title} className="post-img" />
        )}
        <p>{post.content}</p>
        <p><strong>Tags:</strong> {post.tags}</p>
        <p><strong>Upvotes:</strong> {post.upvotes}</p>
      </div>

      <div className="comment-section">
        <h3>Comments</h3>
        <form onSubmit={handleCommentSubmit}>
          <textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          ></textarea>
          <button type="submit">Submit</button>
        </form>

        <div className="comments">
          {comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="comment">
                <p>{c.content}</p>
                <span className="timestamp">
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
