import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CalendarList() {
  const [personalEvents, setPersonalEvents] = useState([]);
  const [sharedEvents, setSharedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const personalRes = await axios.get('/api/events/personal');
      const sharedRes = await axios.get('/api/events/shared');
      setPersonalEvents(personalRes.data);
      setSharedEvents(sharedRes.data);
      setLoading(false);
    } catch (err) {
      console.error('イベント取得エラー', err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (type, id) => {
    try {
      await axios.delete(`/api/events/${type}/${id}`);
      fetchEvents(); // 更新
    } catch (err) {
      console.error('削除エラー', err);
    }
  };

  if (loading) return <p className="text-center mt-4">読み込み中...</p>;

  return (
    <div className="mt-6">
      {/* 個人イベント */}
      <h2 className="text-xl font-bold mb-2">個人イベント</h2>
      {personalEvents.length === 0 ? (
        <p>イベントがありません</p>
      ) : (
        <ul className="space-y-2">
          {personalEvents.map(ev => (
            <li key={ev.id} className="border p-2 rounded shadow-sm hover:bg-purple-50 transition flex justify-between items-center">
              <span><strong>{ev.date} [{ev.time_slot}]</strong>: {ev.title} ({ev.user_id})</span>
              <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete('personal', ev.id)}>削除</button>
            </li>
          ))}
        </ul>
      )}

      {/* 共有イベント */}
      <h2 className="text-xl font-bold mt-6 mb-2">共有イベント</h2>
      {sharedEvents.length === 0 ? (
        <p>共有イベントはありません</p>
      ) : (
        <ul className="space-y-2">
          {sharedEvents.map(ev => (
            <li key={ev.id} className="border p-2 rounded shadow-sm hover:bg-pink-50 transition flex justify-between items-center">
              <span><strong>{ev.date} [{ev.time_slot}]</strong>: {ev.title} (作成者: {ev.create_by})</span>
              <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete('shared', ev.id)}>削除</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
