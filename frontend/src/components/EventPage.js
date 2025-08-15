import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function EventPage() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [events, setEvents] = useState([]);
  const [msg, setMsg] = useState('');

  const fetchEvents = async () => {
    const res = await axios.get('/api/events');
    setEvents(res.data);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/events', { title, date });
      setTitle(''); setDate(''); setMsg('追加成功');
      fetchEvents();
    } catch {
      setMsg('追加失敗');
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">イベントページ</h2>
      <form className="space-y-2" onSubmit={handleSubmit}>
        <input placeholder="イベント名" value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full p-2 border rounded" required />
        <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">追加</button>
      </form>
      {msg && <p className="mt-2">{msg}</p>}
      <ul className="mt-2">
        {events.map(ev => <li key={ev.id}>{ev.date}: {ev.title}</li>)}
      </ul>
    </div>
  );
}
