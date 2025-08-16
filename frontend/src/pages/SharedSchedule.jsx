import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SharedSchedule() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/events/shared').then(res => setEvents(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">共有スケジュール</h2>
      <ul>
        {events.map((e, i) => <li key={i}>{e.title}</li>)}
      </ul>
    </div>
  );
}
