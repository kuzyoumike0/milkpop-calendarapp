import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function SharedCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    axios.get(`${API_BASE_URL}/api/shared?date=${formattedDate}`)
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
        <ul className="text-xs mt-1 space-y-1">
          {dayEvents.map(e => (
            <li key={e.id} className="bg-indigo-100 text-indigo-800 rounded px-1">
              {e.time_slot} {e.title}
            </li>
          ))}
        </ul>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 shadow-lg bg-white rounded-lg mt-10">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">共有カレンダー</h2>
      <Calendar
        value={date}
        onChange={setDate}
        tileContent={tileContent}
        className="rounded-lg border border-gray-200 shadow-sm"
      />
    </div>
  );
}
