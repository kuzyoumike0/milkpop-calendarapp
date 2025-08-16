import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SharedList() {
  const [sharedEvents, setSharedEvents] = useState([]);

  useEffect(() => {
    axios.get('/api/events/shared').then(res => setSharedEvents(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2 mt-6">共有イベント</h2>
      {sharedEvents.length === 0 ? <p>共有イベントがありません</p> : (
        <ul className="space-y-2">
          {sharedEvents.map(ev => (
            <li key={ev.id} className="border p-2 rounded shadow-sm hover:bg-pink-50">
              <span className="font-semibold">{ev.date} [{ev.time_slot}]</span>: {ev.title} (作成者: {ev.created_by})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
