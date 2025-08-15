import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";

export default function CalendarApp() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [username, setUsername] = useState("");
  const [timeSlot, setTimeSlot] = useState("全日");

  // 日付フォーマット関数
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // イベント取得
  useEffect(() => {
    const formattedDate = formatDate(date);
    axios.get(`/api/shared?date=${formattedDate}`)
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, [date]);

  // 追加
  const addEvent = () => {
    if (!username) return alert("ユーザー名を入力してください");
    const formattedDate = formatDate(date);
    const newEvent = {
      date: formattedDate,
      username,
      time_slot: timeSlot,
      title: `${username}の予定`
    };
    axios.post("/api/shared", newEvent)
      .then(res => setEvents([...events, res.data]))
      .catch(err => console.error(err));
    setUsername(""); // 入力クリア
  };

  // 削除
  const deleteEvent = (id) => {
    axios.delete(`/api/shared/${id}`)
      .then(() => setEvents(events.filter(e => e.id !== id)))
      .catch(err => console.error(err));
  };

  // 日付タイルにイベントを表示
  const tileContent = ({ date: d, view }) => {
    if (view === "month") {
      const formattedDate = formatDate(d);
      const dayEvents = events.filter(e => e.date === formattedDate);
      return (
        <ul className="text-xs mt-1 space-y-1">
          {dayEvents.map(e => (
            <li key={e.id} className={`rounded px-1 ${e.time_slot === "全日" ? "bg-indigo-200" : e.time_slot === "昼" ? "bg-yellow-200" : "bg-pink-200"}`}>
              {e.time_slot}: {e.title}
              <button
                onClick={() => deleteEvent(e.id)}
                className="ml-2 text-red-600 font-bold hover:text-red-800"
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
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">共有カレンダー</h2>

      <div className="flex justify-center gap-2 mb-4">
        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <select
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
        <button
          onClick={addEvent}
          className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
        >
          追加
        </button>
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
