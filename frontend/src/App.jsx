import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function App() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ username: '', note: '', date: '', title: '', timeslot: '全日' });

  useEffect(() => {
    axios.get('/api/events').then(res => setEvents(res.data));
  }, []);

  const addEvent = async () => {
    await axios.post('/api/events', form);
    const res = await axios.get('/api/events');
    setEvents(res.data);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>📅 共有カレンダー & 個人スケジュール</h1>
      <div>
        <input placeholder="ユーザー名" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
        <input placeholder="メモ" value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
        <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
        <input placeholder="予定タイトル" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        <select value={form.timeslot} onChange={e => setForm({...form, timeslot: e.target.value})}>
          <option>全日</option>
          <option>朝</option>
          <option>昼</option>
          <option>夜</option>
        </select>
        <button onClick={addEvent}>追加</button>
      </div>
      <ul>
        {events.map((ev, idx) => (
          <li key={idx}>{ev.date} [{ev.timeslot}] {ev.title} - {ev.username} ({ev.note})</li>
        ))}
      </ul>
    </div>
  );
}
