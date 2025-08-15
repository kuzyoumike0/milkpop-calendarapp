import React, { useEffect, useState } from 'react';
import api from '../axios';

export default function CalendarList() {
  const [personalEvents, setPersonalEvents] = useState([]);
  const [sharedEvents, setSharedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const personalRes = await api.get('/api/events/personal');
        const sharedRes = await api.get('/api/events/shared');
        setPersonalEvents(personalRes.data);
        setSharedEvents(sharedRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <p className="text-center mt-4">読み込み中...</p>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">個人イベント</h2>
      {personalEvents.length === 0 ? <p>イベントがありません</p> : personalEvents.map(ev => (
        <div key={ev.id} className="border p-2 rounded shadow-sm hover:bg-purple-50">
          {ev.date} [{ev.time_slot}] {ev.title} ({ev.user_id})
        </div>
      ))}

      <h2 className="text-xl font-bold mt-6 mb-2">共有イベント</h2>
      {sharedEvents.length === 0 ? <p>共有イベントはありません</p> : sharedEvents.map(ev => (
        <div key={ev.id} className="border p-2 rounded shadow-sm hover:bg-pink-50">
          {ev.date} [{ev.time_slot}] {ev.title} (作成者: {ev.create_by})
        </div>
      ))}
    </div>
  );
}
