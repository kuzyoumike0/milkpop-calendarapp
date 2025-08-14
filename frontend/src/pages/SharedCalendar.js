import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";

export default function SharedCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  // 日付が変わるたびに予定を取得
  useEffect(() => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    axios.get(`/api/shared?date=${formattedDate}`)
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, [date]);

  // 日付セルに予定を表示
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${yyyy}-${mm}-${dd}`;

      const dayEvents = events.filter(e => e.date === formattedDate);
      return (
        <ul style={{ paddingLeft: '5px', fontSize: '0.7em' }}>
          {dayEvents.map(e => <li key={e.id}>{e.time_slot} {e.title}</li>)}
        </ul>
      );
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto' }}>
      <h2>共有カレンダー</h2>
      <Calendar
        value={date}
        onChange={setDate}
        tileContent={tileContent}
      />
    </div>
  );
}
