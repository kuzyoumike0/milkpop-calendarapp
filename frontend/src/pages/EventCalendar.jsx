import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function EventCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:8080/events/personal'),
      axios.get('http://localhost:8080/events/shared')
    ]).then(([personal, shared]) => {
      setEvents([...personal.data, ...shared.data]);
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">全イベント表示</h2>
      <ul>
        {events.map((e, i) => <li key={i}>{e.title}</li>)}
      </ul>
    </div>
  );
}
