import React, { useState } from 'react'

function PersonalScheduleView() {
  const [events, setEvents] = useState([])
  const [title, setTitle] = useState("")
  const [memo, setMemo] = useState("")

  const addEvent = () => {
    setEvents([...events, { title, memo }])
    setTitle("")
    setMemo("")
  }

  return (
    <div className="backdrop-blur-lg bg-white/30 p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">個人スケジュール</h2>
      <input placeholder="タイトル" value={title} onChange={e => setTitle(e.target.value)} className="border p-2 mr-2" />
      <input placeholder="メモ" value={memo} onChange={e => setMemo(e.target.value)} className="border p-2 mr-2" />
      <button onClick={addEvent} className="bg-blue-500 text-white px-4 py-2 rounded">追加</button>

      <ul className="mt-4">
        {events.map((ev, i) => (
          <li key={i} className="border p-2 mb-2 rounded">
            {ev.title} - {ev.memo}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PersonalScheduleView
