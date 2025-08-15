import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');

  const fetchEvents = async () => {
    const res = await axios.get('/api/events/shared');
    setEvents(res.data);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/events/shared', { title, date, time_slot: '全日', created_by: 'admin' });
      setMessage('イベントを追加しました');
      setTitle('');
      setDate('');
      fetchEvents();
    } catch {
      setMessage('エラーが発生しました');
    }
  };

  return (
    <div>
      <form className="space-y-4 mb-6" onSubmit={handleSubmit}>
        <input className="w-full p-2 border rounded" placeholder="イベント名" value={title} onChange={e => setTitle(e.target.value)} required />
        <input className="w-full p-2 border rounded" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">追加</button>
      </form>

      <h2 className="text-xl font-bold mb-2">登録済みイベント</h2>
      {events.length === 0 ? <p>イベントがありません</p> :
        <ul className="space-y-2">
          {events.map(ev => (
            <li key={ev.id} className="border p-2 rounded shadow-sm hover:bg-green-50 transition">
              <span className="font-semibold">{ev.date}</span>: {ev.title}
            </li>
          ))}
        </ul>
      }
      {message && <p className="text-center mt-2">{message}</p>}
    </div>
  );
}
