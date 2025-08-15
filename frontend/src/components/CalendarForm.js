import React, { useState } from 'react';
import axios from 'axios';

export default function CalendarForm({ onAdd }) {
  const [user, setUser] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/events/personal', { user_id: user, date, time_slot: timeSlot, title });
      setMessage('追加しました');
      setUser(''); setTitle(''); setDate(''); setTimeSlot('全日');
      if(onAdd) onAdd();
    } catch (err) {
      setMessage('エラー');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input placeholder="ユーザー名" value={user} onChange={e => setUser(e.target.value)} className="w-full p-2 border rounded" required />
      <input placeholder="タイトル" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" required />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded" required />
      <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} className="w-full p-2 border rounded">
        <option>全日</option><option>昼</option><option>夜</option>
      </select>
      <button className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600">追加</button>
      {message && <p className="text-center mt-2">{message}</p>}
    </form>
  );
}
