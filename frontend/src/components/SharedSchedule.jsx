import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SharedSchedule() {
  const [sharedEvents, setSharedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/events/shared');
        setSharedEvents(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchShared();
  }, []);

  if (loading) return <p className="text-center mt-4">読み込み中...</p>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">共有スケジュール</h2>
      {sharedEvents.length === 0 ? (
        <p>共有イベントはありません</p>
      ) : (
        <ul className="space-y-2">
          {sharedEvents.map(ev => (
            <li key={ev.id} className="border p-2 rounded shadow-sm hover:bg-pink-50 transition">
              <span className="font-semibold">{ev.date} [{ev.time_slot}]</span>: {ev.title} (作成者: {ev.created_by})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
