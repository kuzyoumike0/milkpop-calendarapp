import React, { useState } from 'react';
import axios from 'axios';

export default function CalendarForm({ onAdded }) {
  const [user, setUser] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.post('/api/events/personal', {
        user_id: user,
        date,
        time_slot: timeSlot,
        title
      });

      setMessage('イベントを追加しました！');
      setUser('');
      setTitle('');
      setDate('');
      setTimeSlot('全日');

      if (onAdded) onAdded(); // リスト更新用に親に通知
    } catch (err) {
      console.error(err);
      setMessage('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input
        className="w-full p-2 border rounded"
        placeholder="ユーザー名"
        value={user}
        onChange={e => setUser(e.target.value)}
        required
      />
      <input
        className="w-full p-2 border rounded"
        type="text"
        placeholder="タイトル"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <input
        className="w-full p-2 border rounded"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        required
      />
      <select
        className="w-full p-2 border rounded"
        value={timeSlot}
        onChange={e => setTimeSlot(e.target.value)}
      >
        <option>全日</option>
        <option>昼</option>
        <option>夜</option>
      </select>
      <button
        type="submit"
        className={`w-full p-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-purple-500 hover:bg-purple-600'}`}
        disabled={loading}
      >
        {loading ? '追加中…' : '追加'}
      </button>
      {message && <p className="text-center mt-2 text-purple-700">{message}</p>}
    </form>
  );
}
