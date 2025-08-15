import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";
import dayjs from "dayjs";

export default function PersonalCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [user, setUser] = useState("");
  const [timeSlot, setTimeSlot] = useState("全日");

  const userId = "1";

  const fetchEvents = () => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    axios.get(`/api/personal/${userId}?date=${formattedDate}`).then(res => setEvents(res.data));
  };

  useEffect(() => { fetchEvents(); }, [date]);

  const addEvent = () => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    axios.post("/api/personal", { title, user, time_slot: timeSlot, date: formattedDate, userId })
      .then(() => {
        setTitle(""); setUser(""); setTimeSlot("全日"); fetchEvents();
      });
  };

  const deleteEvent = (id) => {
    axios.delete(`/api/personal/${id}`).then(() => fetchEvents());
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    const dayEvents = events.filter(e => e.date === formattedDate);
    return (
      <ul className="text-xs mt-1 space-y-1">
        {dayEvents.map(e => {
          let bgColor = e.time_slot === "全日" ? "bg-yellow-200 text-yellow-800"
            : e.time_slot === "昼" ? "bg-green-200 text-green-800"
            : "bg-indigo-200 text-indigo-800";
          return (
            <li key={e.id} className="rounded px-1 flex justify-between">
              <span className={bgColor}>{e.time_slot} {e.title} ({e.user})</span>
              <button className="text-red-500 ml-2" onClick={() => deleteEvent(e.id)}>×</button>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 shadow-lg bg-white rounded-lg mt-10">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">個人カレンダー</h2>

      <div className="flex justify-center gap-2 mb-4">
        <input placeholder="ユーザー名" value={user} onChange={e => setUser(e.target.value)}
               className="border px-2 py-1 rounded"/>
        <input placeholder="予定タイトル" value={title} onChange={e => setTitle(e.target.value)}
               className="border px-2 py-1 rounded"/>
        <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)}
                className="border px-2 py-1 rounded">
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
        </select>
        <button onClick={addEvent} className="bg-indigo-500 text-white px-3 py-1 rounded">追加</button>
      </div>

      <Calendar value={date} onChange={setDate} tileContent={tileContent}
                className="rounded-lg border border-gray-200 shadow-sm"/>
    </div>
  );
}
