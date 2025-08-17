import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState('2025-08-17');

  useEffect(() => {
    axios.get(`/api/schedules?date=${date}`).then(res => setEvents(res.data));
  }, [date]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📅 共有カレンダー</h1>
      <ul>
        {events.map(ev => (
          <li key={ev.id} className="p-2 bg-white shadow mb-2 rounded">
            {ev.date} [{ev.timeslot}] {ev.title} - {ev.username} ({ev.memo})
          </li>
        ))}
      </ul>
    </div>
  );
}
