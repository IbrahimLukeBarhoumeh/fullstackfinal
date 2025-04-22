import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { FaThumbsUp, FaThumbsDown, FaEdit, FaRetweet, FaCommentDots } from 'react-icons/fa'
import { Link } from 'react-router-dom'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [commentsMap, setCommentsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filtered, setFiltered] = useState([])

  useEffect(() => {
    fetchPostsAndComments()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [search, posts, sortBy])

  const fetchPostsAndComments = async () => {
    setLoading(true)

    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: allComments, error: commentError } = await supabase
      .from('comments')
      .select('*')

    if (postError || commentError) {
      console.error(postError || commentError)
      setError('Failed to load posts or comments.')
    } else {
      const grouped = allComments.reduce((acc, comment) => {
        acc[comment.post_id] = acc[comment.post_id] || []
        acc[comment.post_id].push(comment)
        return acc
      }, {})
      setCommentsMap(grouped)
      setPosts(postData)
    }

    setLoading(false)
  }

  const handleVote = async (postId, type) => {
    const post = posts.find(p => p.id === postId)
    const newVotes = type === 'up' ? post.upvotes + 1 : Math.max(post.upvotes - 1, 0)

    const { error } = await supabase
      .from('posts')
      .update({ upvotes: newVotes })
      .eq('id', postId)

    if (!error) fetchPostsAndComments()
    else alert('Failed to update vote')
  }

  const filterPosts = () => {
    let temp = [...posts]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      temp = temp.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.tags && p.tags.toLowerCase().includes(q))
      )
    }
    if (sortBy === 'popular') {
      temp.sort((a, b) => b.upvotes - a.upvotes)
    } else {
      temp.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    setFiltered(temp)
  }

  const renderTags = (tagString) => {
    if (!tagString) return null
    return tagString
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean)
      .map((tag, i) => (
        <span key={i} style={{ marginRight: '8px', fontWeight: 500, color: '#66d9ef' }}>
          #{tag}
        </span>
      ))
  }

  return (
    <div className="page">
      <header className="header-flex">
        <h1 className="logo">🔥 GrillNChill</h1>
        <div className="toolbar">
          <input
            type="text"
            placeholder="Search by title or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <div className="sort-buttons">
            <button
              className={sortBy === 'newest' ? 'active-sort' : ''}
              onClick={() => setSortBy('newest')}
            >
              🕒 Newest
            </button>
            <button
              className={sortBy === 'popular' ? 'active-sort' : ''}
              onClick={() => setSortBy('popular')}
            >
              🔥 Most Upvoted
            </button>
          </div>
        </div>
      </header>

      {loading && <p>Loading posts...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && filtered.length === 0 && (
        <p>No matching posts found.</p>
      )}

      <div className="post-grid">
        {filtered.map(post => (
          <div key={post.id} className="post-card">
            <h2>
              <Link to={`/post/${post.id}`} className="post-title-link">
                {post.title}
              </Link>
            </h2>

            {post.repost_id && (
              <p className="repost-meta">
                <FaRetweet /> Repost of <Link to={`/post/${post.repost_id}`}>another post</Link>
              </p>
            )}

            {post.image_url && (
              <img src={post.image_url} alt={post.title} className="post-img" />
            )}

            <p>{post.content?.slice(0, 150)}...</p>
            <p><strong>Tags:</strong> {renderTags(post.tags)}</p>

            <div className="post-actions">
              <div>
                <strong>Upvotes:</strong> {post.upvotes}
                <button onClick={() => handleVote(post.id, 'up')} className="icon-btn">
                  <FaThumbsUp />
                </button>
                <button onClick={() => handleVote(post.id, 'down')} className="icon-btn">
                  <FaThumbsDown />
                </button>
              </div>
              <div className="action-row">
                <Link to={`/post/${post.id}`} className="comment-btn">
                  <FaCommentDots /> {commentsMap[post.id]?.length || 0}
                </Link>
                <Link to={`/edit/${post.id}`} className="edit-btn">
                  <FaEdit /> Edit
                </Link>
                <Link to={`/create?repost=${post.id}`} className="repost-btn">
                  <FaRetweet /> Repost
                </Link>
              </div>
            </div>

            {commentsMap[post.id]?.length > 0 && (
              <div className="inline-comments">
                <p className="inline-header">Top Comment:</p>
                <div className="comment-snippet">
                  <p>{commentsMap[post.id][0].content}</p>
                  <small>{new Date(commentsMap[post.id][0].created_at).toLocaleString()}</small>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
