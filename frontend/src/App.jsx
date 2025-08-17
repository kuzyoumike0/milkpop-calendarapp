import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function App() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [username, setUsername] = useState("");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [memo, setMemo] = useState("");

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`/api/shared?date=${formatDate(date)}`);
      setEvents(res.data);
    };
    fetchData();
  }, [date]);

  const addEvent = async () => {
    await axios.post("/api/add", {
      date: formatDate(date),
      username,
      time_slot: timeSlot,
      memo,
      type: "shared"
    });
    setUsername("");
    setMemo("");
    const res = await axios.get(`/api/shared?date=${formatDate(date)}`);
    setEvents(res.data);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">📅 共有カレンダー</h1>
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6">
        <Calendar onChange={setDate} value={date} />
        <h2 className="mt-4 font-semibold">選択した日: {formatDate(date)}</h2>

        <div className="mt-4">
          <input
            className="border rounded p-2 mr-2"
            placeholder="ユーザー名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <select
            className="border rounded p-2 mr-2"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
          >
            <option>全日</option>
            <option>午前</option>
            <option>午後</option>
            <option>夜</option>
          </select>
          <input
            className="border rounded p-2 mr-2"
            placeholder="メモ"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={addEvent}
          >
            追加
          </button>
        </div>

        <ul className="mt-4">
          {events.map((ev) => (
            <li key={ev.id} className="p-2 border-b">
              <span className="font-semibold">{ev.username}</span> ({ev.time_slot}) - {ev.memo}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
