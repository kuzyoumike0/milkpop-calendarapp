import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CalendarList() {
  const [personalEvents, setPersonalEvents] = useState([]);
  const [sharedEvents, setSharedEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const personal = await axios.get('/api/events/personal');
      const shared = await axios.get('/api/events/shared');
      setPersonalEvents(personal.data);
      setSharedEvents(shared.data);
    };
    fetchData();
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">個人イベント</h2>
      {personalEvents.map(ev => (
        <div key={ev.id} className="border p-2 rounded shadow-sm hover:bg-purple-50">
          {ev.date} [{ev.time_slot}] {ev.title} ({ev.user_id})
        </div>
      ))}

      <h2 className="text-xl font-bold mt-6 mb-2">共有イベント</h2>
      {sharedEvents.map(ev => (
        <div key={ev.id} className="border p-2 rounded shadow-sm hover:bg-pink-50">
          {ev.date} [{ev.time_slot}] {ev.title} (作成者: {ev.create_by})
        </div>
      ))}
    </div>
  );
}
