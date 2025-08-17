import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";

export default function App() {
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [memo, setMemo] = useState("");
  const [timeslot, setTimeslot] = useState("全日");

  const fetchEvents = async () => {
    const res = await axios.get("/api/events");
    setEvents(res.data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const addEvent = async () => {
    await axios.post("/api/events", { date, title, username, memo, timeslot });
    fetchEvents();
  };

  return (
    <div className="glass p-6">
      <h1 className="title">共有カレンダー & 個人スケジュール</h1>
      <Calendar value={date} onChange={setDate} />
      <div className="form">
        <input placeholder="予定タイトル" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <input placeholder="ユーザー名" value={username} onChange={(e)=>setUsername(e.target.value)} />
        <input placeholder="メモ" value={memo} onChange={(e)=>setMemo(e.target.value)} />
        <select value={timeslot} onChange={(e)=>setTimeslot(e.target.value)}>
          <option value="全日">全日</option>
          <option value="午前">午前</option>
          <option value="午後">午後</option>
          <option value="夜">夜</option>
        </select>
        <button onClick={addEvent}>追加</button>
      </div>
      <ul className="event-list">
        {events.map(ev => (
          <li key={ev.id}>
            {ev.date} [{ev.timeslot}] {ev.title} ({ev.username}) - {ev.memo}
          </li>
        ))}
      </ul>
    </div>
  );
}
