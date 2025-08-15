import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CalendarList({ refresh }) {
  const [personalEvents, setPersonalEvents] = useState([]);
  const [sharedEvents, setSharedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // データ取得関数
  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const personalRes = await axios.get('/api/events/personal');
      const sharedRes = await axios.get('/api/events/shared');
      setPersonalEvents(personalRes.data);
      setSharedEvents(sharedRes.data);
    } catch (err) {
      console.error('イベント取得エラー', err);
      setError('イベントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 初回ロード＆refresh変更時に取得
  useEffect(() => {
    fetchEvents();
  }, [refresh]);

  if (loading) return <p className="text-center mt-4">読み込み中...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">{error}</p>;

  return (
    <div className="mt-6">
      {/* 個人イベント */}
      <h2 className="text-xl font-bold mb-2">個人イベント</h2>
      {personalEvents.length === 0 ? (
        <p>イベントがありません</p>
      ) : (
        <ul className="space-y-2">
          {personalEvents.map(ev => (
            <li
              key={ev.id}
              className="border p-2 rounded shadow-sm hover:bg-purple-50 transition"
            >
              <span className="font-semibold">{ev.date} [{ev.time_slot}]</span>: {ev.title} ({ev.user_id})
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
            <li
              key={ev.id}
              className="border p-2 rounded shadow-sm hover:bg-pink-50 transition"
            >
              <span className="font-semibold">{ev.date} [{ev.time_slot}]</span>: {ev.title} (作成者: {ev.created_by})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
