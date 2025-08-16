import React, { useState } from 'react';
import axios from 'axios';

export default function PersonalSchedule() {
  const [title, setTitle] = useState('');
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    const res = await axios.get('http://localhost:8080/events/personal');
    setEvents(res.data);
  };

  const addEvent = async () => {
    await axios.post('http://localhost:8080/events/personal', { title });
    setTitle('');
    fetchEvents();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">個人スケジュール追加</h2>
      <input value={title} onChange={e => setTitle(e.target.value)} className="border p-1 mr-2"/>
      <button onClick={addEvent} className="bg-blue-500 text-white px-2">追加</button>

      <ul className="mt-4">
        {events.map((e, i) => <li key={i}>{e.title}</li>)}
      </ul>
    </div>
  );
}
