import React, { useState } from 'react';
import axios from 'axios';

export default function PersonalPage() {
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [username, setUsername] = useState('');
  const [timeslot, setTimeslot] = useState('全日');
  const [date, setDate] = useState('2025-08-17');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/schedules', { username, memo, date, timeslot, title });
    alert('予定を追加しました！');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👤 個人スケジュール</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="名前" className="p-2 border rounded w-full" />
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="予定タイトル" className="p-2 border rounded w-full" />
        <textarea value={memo} onChange={e=>setMemo(e.target.value)} placeholder="メモ" className="p-2 border rounded w-full" />
        <select value={timeslot} onChange={e=>setTimeslot(e.target.value)} className="p-2 border rounded w-full">
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
        </select>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="p-2 border rounded w-full" />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">追加</button>
      </form>
    </div>
  );
}
