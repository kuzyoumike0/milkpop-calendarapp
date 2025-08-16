import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function SharedCalendar() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    axios.get('/api/shared').then(res => setEvents(res.data))
  }, [])

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">共有スケジュール</h2>
      <ul className="list-disc pl-5">
        {events.map((e, i) => (
          <li key={i}>{e.memo} ({e.time})</li>
        ))}
      </ul>
    </div>
  )
}
