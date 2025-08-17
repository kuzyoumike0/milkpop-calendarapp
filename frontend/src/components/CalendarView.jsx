import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CalendarView() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("/api/schedules").then((res) => setEvents(res.data));
  }, []);

  return (
    <div>
      <h2>予定一覧</h2>
      <ul>
        {events.map((e) => (
          <li key={e.id}>
            {e.date} [{e.timeslot}] {e.title}
          </li>
        ))}
      </ul>
    </div>
  );
}