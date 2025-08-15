// src/pages/PersonalCalendar.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";
import dayjs from "dayjs";

export default function PersonalCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState(1); // ユーザーID
  const [newEvent, setNewEvent] = useState({ time_slot: "全日", title: "" });

  const fetchEvents = () => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    axios.get(`/api/personal/${userId}?date=${formattedDate}`)
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => fetchEvents(), [date, userId]);

  const handleAddEvent = () => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    axios.post(`/api/personal/${userId}`, { ...newEvent, date: formattedDate })
      .then(() => {
        setNewEvent({ time_slot: "全日", title: "" });
        fetchEvents();
      })
      .catch(err => console.error(err));
  };

  const handleDeleteEvent = (id) => {
    axios.delete(`/api/personal/${userId}/${id}`).then(() => fetchEvents());
  };

  const timeSlotColor = {
    全日: "bg-blue-100 text-blue-800",
    昼: "bg-yellow-100 text-yellow-800",
    夜: "bg-purple-100 text-purple-800"
  };

  const tileContent = ({ date: d, view }) => {
    if (view === 'month') {
      const formattedDate = dayjs(d).format("YYYY-MM-DD");
      const dayEvents = events.filter(e => e.date === formattedDate);
      return (
        <ul className="mt-1 space-y-1 text-xs">
          {dayEvents.map(e => (
            <li key={e.id} className={`px-1 rounded ${timeSlotColor[e.time_slot]}`}>
              {e.time_slot} {e.title}
            </li>
          ))}
        </ul>
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">個人カレンダー</h2>
      <div className="flex flex-col md:flex-row gap-6">
        {/* 左: カレンダー */}
        <div className="md:w-1/3 bg-white rounded-lg shadow p-4">
          <Calendar
            value={date}
            onChange={setDate}
            className="rounded-lg border border-gray-200"
            tileContent={tileContent}
          />
        </div>

        {/* 右: 予定一覧 & 追加 */}
        <div className="md:w-2/3 bg-white rounded-lg shadow p-4 flex flex-col gap-4">
          {/* 追加フォーム */}
          <div className="bg-gray-50 p-4 rounded flex flex-col md:flex-row gap-2 items-center">
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

          {/* 予定リスト */}
          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-gray-400 text-center">予定はありません</p>
            ) : (
              events.map(e => (
                <div key={e.id} className={`flex justify-between items-center p-2 border rounded ${timeSlotColor[e.time_slot]} hover:opacity-90`}>
                  <div>
                    <span className="font-semibold">{e.time_slot}</span>{" "}
                    <span>{e.title}</span>
                  </div>
                  <button className="text-red-500 font-bold" onClick={() => handleDeleteEvent(e.id)}>×</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
