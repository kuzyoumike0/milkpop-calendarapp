import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import 'react-calendar/dist/Calendar.css';

export default function App() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [memo, setMemo] = useState("");

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchEvents = async (d) => {
    const res = await axios.get(`/api/events?date=${formatDate(d)}`);
    setEvents(res.data);
  };

  useEffect(() => {
    fetchEvents(date);
  }, [date]);

  const addEvent = async () => {
    await axios.post("/api/events", {
      date: formatDate(date),
      title,
      username,
      memo,
      is_shared: true,
    });
    setTitle("");
    setUsername("");
    setMemo("");
    fetchEvents(date);
  };

  const deleteEvent = async (id) => {
    await axios.delete(`/api/events/${id}`);
    fetchEvents(date);
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100 backdrop-blur-md bg-opacity-70">
      <h1 className="text-3xl font-bold text-center mb-6">📅 共有カレンダー & 個人スケジュール</h1>
      <Calendar value={date} onChange={setDate} className="mx-auto mb-6 bg-white rounded-lg shadow-lg" />
      
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4">予定の追加</h2>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="タイトル" className="border p-2 w-full mb-2" />
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ユーザー名" className="border p-2 w-full mb-2" />
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="メモ" className="border p-2 w-full mb-2" />
        <button onClick={addEvent} className="bg-blue-500 text-white px-4 py-2 rounded-lg">追加</button>
      </div>

      <div className="max-w-xl mx-auto mt-6">
        <h2 className="text-lg font-semibold">予定一覧 ({formatDate(date)})</h2>
        {events.map((ev) => (
          <div key={ev.id} className="bg-white rounded-lg shadow p-4 mt-2 flex justify-between">
            <div>
              <p className="font-bold">{ev.title}</p>
              <p className="text-sm text-gray-600">👤 {ev.username}</p>
              <p className="text-sm">{ev.memo}</p>
            </div>
            <button onClick={() => deleteEvent(ev.id)} className="text-red-500">削除</button>
          </div>
        ))}
      </div>
    </div>
  );
}
