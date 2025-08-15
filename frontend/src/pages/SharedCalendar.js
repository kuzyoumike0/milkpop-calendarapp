import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './App.css';
import axios from "axios";

export default function SharedCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");

    // 月単位で予定を取得
    axios.get(`/api/shared?month=${yyyy}-${mm}`)
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, [date]);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${yyyy}-${mm}-${dd}`;

      const dayEvents = events.filter(e => e.date === formattedDate);
      return (
        <ul style={{ paddingLeft: '5px', fontSize: '0.7em', margin: 0 }}>
          {dayEvents.map(e => (
            <li key={e.id} style={{ listStyle: 'none' }}>
              {e.time_slot} {e.title}
            </li>
          ))}
        </ul>
      );
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '10px' }}>
      <h2 style={{ textAlign: 'center', color: '#4f46e5' }}>共有カレンダー</h2>
      <Calendar
        value={date}
        onChange={setDate}
        tileContent={tileContent}
      />
    </div>
  );
}
