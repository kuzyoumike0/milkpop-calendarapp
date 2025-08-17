import { useState } from 'react'
import axios from 'axios'

export default function Shared() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const createLink = async () => {
    try {
      const res = await axios.post('/api/shared_links')
      setUrl(window.location.origin + res.data.url)
      setError('')
    } catch (e) {
      setError('エラー: ' + e.message)
    }
  }

  return <div className="p-6">
    <h1 className="text-xl mb-4">共有カレンダー</h1>
    <button onClick={createLink} className="bg-blue-500 text-white px-4 py-2">共有リンクを発行</button>
    {url && <div className="mt-2">共有リンク: <a href={url}>{url}</a></div>}
    {error && <div className="text-red-500">{error}</div>}
  </div>
}