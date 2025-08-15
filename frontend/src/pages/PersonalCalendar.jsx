// src/pages/PersonalCalendar.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";

export default function PersonalCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // 日付を YYYY-MM-DD 形式に変換
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    // ユーザーID 1 の例
    axios.get(`/api/personal/1?date=${formattedDate}`)
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
          {dayEvents.map(e => {
            // 時間帯で色分け
            let bgColor = "bg-green-100 text-green-800";
            if (e.time_slot >= "12:00" && e.time_slot < "18:00") bgColor = "bg-yellow-100 text-yellow-800";
            if (e.time_slot >= "18:00") bgColor = "bg-red-100 text-red-800";

            return (
              <li key={e.id} className={`${bgColor} rounded px-1`}>
                {e.time_slot} {e.title}
              </li>
            );
          })}
        </ul>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 shadow-lg bg-white rounded-lg mt-10">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">個人カレンダー</h2>
      <Calendar
        value={date}
        onChange={setDate}
        tileContent={tileContent}
        className="rounded-lg border border-gray-200 shadow-sm"
      />
    </div>
  );
}
