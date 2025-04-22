import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import PostForm from '../components/PostForm'

export default function Create() {
  const [searchParams] = useSearchParams()
  const [prefillData, setPrefillData] = useState(null)
  const repostId = searchParams.get('repost')

  useEffect(() => {
    const fetchRepostData = async () => {
      if (!repostId) return

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', repostId)
        .single()

      if (!error && data) {
        setPrefillData({
          title: `Repost: ${data.title}`,
          content: data.content,
          image_url: data.image_url,
          video_url: data.video_url,
          tags: data.tags,
          repost_id: data.id,
        })
      }
    }

    fetchRepostData()
  }, [repostId])

  return (
    <div className="page">
      <h2>{repostId ? 'Reposting a Post' : 'Create a New Post'}</h2>
      <PostForm prefill={prefillData} />
    </div>
  )
}
