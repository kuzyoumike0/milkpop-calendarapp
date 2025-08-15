import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";
import dayjs from "dayjs";

export default function PersonalCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    axios.get(`/api/personal/1?date=${formattedDate}`)
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, [date]);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      const dayEvents = events.filter(e => e.date === formattedDate);
      return (
        <ul className="text-xs mt-1 space-y-1">
          {dayEvents.map(e => {
            let bgColor = e.time_slot < "12:00" ? "bg-yellow-200 text-yellow-800" :
                          e.time_slot < "18:00" ? "bg-green-200 text-green-800" :
                          "bg-indigo-200 text-indigo-800";
            return (
              <li key={e.id} className={`rounded px-1 ${bgColor}`}>
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
