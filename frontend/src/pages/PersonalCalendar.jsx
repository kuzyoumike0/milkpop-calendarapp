import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function PersonalCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState(1);
  const [username, setUsername] = useState("");
  const [timeSlot, setTimeSlot] = useState("全日");

  useEffect(() => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    axios.get(`${API_BASE_URL}/api/personal/${userId}?date=${formattedDate}`)
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, [date, userId]);

  const addEvent = () => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    const newEvent = { id: Date.now(), date: formattedDate, time_slot: timeSlot, title: username };
    setEvents([...events, newEvent]);
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

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
            <li key={e.id} className="bg-green-100 text-green-800 rounded px-1 flex justify-between">
              <span>{e.time_slot} {e.title}</span>
              <button onClick={() => deleteEvent(e.id)} className="text-red-600 font-bold">x</button>
            </li>
          ))}
        </ul>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 shadow-lg bg-white rounded-lg mt-10">
      <h2 className="text-2xl font-bold text-center text-green-600 mb-6">個人カレンダー</h2>

      <div className="flex justify-center mb-4 space-x-2">
        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="border rounded px-2 py-1">
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
        </select>
        <button onClick={addEvent} className="bg-green-500 text-white px-3 py-1 rounded">追加</button>
      </div>

      <Calendar
        value={date}
        onChange={setDate}
        tileContent={tileContent}
        className="rounded-lg border border-gray-200 shadow-sm"
      />
    </div>
  );
}
