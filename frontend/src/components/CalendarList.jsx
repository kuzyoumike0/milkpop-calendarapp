import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CalendarList() {
  const [personalEvents, setPersonalEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/events/personal');
        setPersonalEvents(res.data);
        setLoading(false);
      } catch (err) {
        console.error('イベント取得エラー', err);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <p className="text-center mt-4">読み込み中...</p>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">個人イベント</h2>
      {personalEvents.length === 0 ? (
        <p>イベントがありません</p>
      ) : (
        <ul className="space-y-2">
          {personalEvents.map(ev => (
            <li key={ev.id} className="border p-2 rounded shadow-sm hover:bg-purple-50 transition">
              <span className="font-semibold">{ev.date} [{ev.time_slot}]</span>: {ev.title} ({ev.user_id})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
