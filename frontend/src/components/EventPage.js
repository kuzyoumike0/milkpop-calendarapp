import React, { useState, useEffect } from 'react';
import api from '../axios';

export default function EventPage() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    const res = await api.get('/api/events/shared');
    setEvents(res.data);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleAdd = async () => {
    await api.post('/api/events/shared', { title, date, time_slot: '全日', create_by: 'admin' });
    setTitle(''); setDate('');
    fetchEvents();
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">イベント登録ページ</h2>
      <input type="text" placeholder="イベント名" value={title} onChange={e => setTitle(e.target.value)} className="border p-2 rounded w-full mb-2"/>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded w-full mb-2"/>
      <button onClick={handleAdd} className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 mb-4">追加</button>
      <div>
        {events.map(ev => (
          <div key={ev.id} className="border p-2 rounded shadow-sm hover:bg-green-50 mb-1">
            {ev.date} {ev.title} (作成者: {ev.create_by})
          </div>
        ))}
      </div>
    </div>
  );
}
