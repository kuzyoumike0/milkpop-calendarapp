import React, { useState } from 'react'
import axios from 'axios'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

function CalendarView() {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(new Date())
  const [link, setLink] = useState("")

  const addEvent = async () => {
    await axios.post('/api/events', {
      title,
      start_date: date,
      end_date: date
    })
    alert('登録しました')
  }

  const generateLink = async () => {
    const res = await axios.post('/api/generate-link')
    setLink(res.data.link)
  }

  return (
    <div className="backdrop-blur-lg bg-white/30 p-6 rounded-xl shadow-md">
      <h2 className="text-xl mb-4 font-bold">共有カレンダー</h2>
      <input className="border p-2 mr-2" value={title} onChange={e => setTitle(e.target.value)} placeholder="タイトル入力" />
      <Calendar onChange={setDate} value={date} />
      <button onClick={addEvent} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">追加</button>

      <div className="mt-4">
        <button onClick={generateLink} className="bg-green-500 text-white px-4 py-2 rounded">共有リンク発行</button>
        {link && <p className="mt-2">共有リンク: <a className="text-blue-700 underline" href={link}>{link}</a></p>}
      </div>
    </div>
  )
}

export default CalendarView
