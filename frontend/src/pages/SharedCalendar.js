import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SharedCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("/api/shared?date=2025-08-15")
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>共有カレンダー</h2>
      <ul>
        {events.map(e => (
          <li key={e.id}>{e.time_slot} - {e.title}</li>
        ))}
      </ul>
    </div>
  );
}
