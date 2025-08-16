import React, { useState } from 'react';
import axios from 'axios';

export default function CalendarForm() {
  const [user, setUser] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/events/personal', {
        user_id: user,
        date,
        time_slot: timeSlot,
        title
      });
      setMessage('イベントを追加しました！');
    } catch (err) {
      setMessage('エラーが発生しました');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input className="w-full p-2 border rounded" placeholder="ユーザー名" value={user} onChange={e => setUser(e.target.value)} required />
      <input className="w-full p-2 border rounded" type="text" placeholder="タイトル" value={title} onChange={e => setTitle(e.target.value)} required />
      <input className="w-full p-2 border rounded" type="date" value={date} onChange={e => setDate(e.target.value)} required />
      <select className="w-full p-2 border rounded" value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
        <option>全日</option>
        <option>昼</option>
        <option>夜</option>
      </select>
      <button className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600">追加</button>
      {message && <p className="text-center mt-2">{message}</p>}
    </form>
  );
}
