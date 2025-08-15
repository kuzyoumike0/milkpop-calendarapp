// src/pages/SharedCalendar.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";

export default function SharedCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    user: "",
    time_slot: "全日",
    title: "",
  });

  const fetchEvents = () => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    axios.get(`/api/events?date=${formattedDate}`)
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchEvents();
  }, [date]);

  const handleAddEvent = () => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    axios.post("/api/events", { ...newEvent, date: formattedDate })
      .then(() => {
        setNewEvent({ user: "", time_slot: "全日", title: "" });
        fetchEvents();
      })
      .catch(err => console.error(err));
  };

  const handleDeleteEvent = (id) => {
    axios.delete(`/api/events/${id}`)
      .then(() => fetchEvents())
      .catch(err => console.error(err));
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
            <li key={e.id} className="bg-indigo-100 text-indigo-800 rounded px-1 flex justify-between items-center">
              <span>{e.time_slot} {e.title} ({e.user})</span>
              <button
                className="text-red-500 ml-2"
                onClick={() => handleDeleteEvent(e.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 shadow-lg bg-white rounded-lg mt-10">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">共有カレンダー</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">予定を追加</h3>
        <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
          <input
            type="text"
            placeholder="ユーザー名"
            className="border rounded px-2 py-1 flex-1"
            value={newEvent.user}
            onChange={(e) => setNewEvent({ ...newEvent, user: e.target.value })}
          />
          <select
            className="border rounded px-2 py-1"
            value={newEvent.time_slot}
            onChange={(e) => setNewEvent({ ...newEvent, time_slot: e.target.value })}
          >
            <option value="全日">全日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
          </select>
          <input
            type="text"
            placeholder="予定タイトル"
            className="border rounded px-2 py-1 flex-1"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          <button
            className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
            onClick={handleAddEvent}
          >
            追加
          </button>
        </div>
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
