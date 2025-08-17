import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

function SharedLinkView() {
  const { linkId } = useParams()
  const [events, setEvents] = useState([])
  const [username, setUsername] = useState("")
  const [title, setTitle] = useState("")
  const [memo, setMemo] = useState("")

  useEffect(() => {
    axios.get(`/api/events?linkId=${linkId}`).then(res => setEvents(res.data))
  }, [linkId])

  const addEvent = async () => {
    await axios.post('/api/events', {
      title,
      start_date: new Date(),
      end_date: new Date(),
      username,
      memo,
      link_id: linkId
    })
    axios.get(`/api/events?linkId=${linkId}`).then(res => setEvents(res.data))
  }

  return (
    <div className="backdrop-blur-lg bg-white/30 p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">共有リンクカレンダー</h2>
      <input placeholder="ユーザー名" value={username} onChange={e => setUsername(e.target.value)} className="border p-2 mr-2" />
      <input placeholder="タイトル" value={title} onChange={e => setTitle(e.target.value)} className="border p-2 mr-2" />
      <input placeholder="メモ" value={memo} onChange={e => setMemo(e.target.value)} className="border p-2 mr-2" />
      <button onClick={addEvent} className="bg-blue-500 text-white px-4 py-2 rounded">追加</button>

      <ul className="mt-4">
        {events.map(ev => (
          <li key={ev.id} className="border p-2 mb-2 rounded">
            {ev.start_date} ~ {ev.end_date} : {ev.title} ({ev.username}) [{ev.memo}]
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SharedLinkView
