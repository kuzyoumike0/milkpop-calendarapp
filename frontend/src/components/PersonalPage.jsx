import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PersonalPage() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    axios.get("/api/personal").then((res) => setEvents(res.data));
  }, []);

  const addEvent = async () => {
    if (!title || !date) return alert("タイトルと日付は必須です");
    await axios.post("/api/personal", { title, date, time });
    const res = await axios.get("/api/personal");
    setEvents(res.data);
    setTitle("");
    setDate("");
    setTime("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>👤 個人スケジュール</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="予定のタイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <button onClick={addEvent}>追加</button>
      </div>

      {events.length === 0 ? (
        <p>予定がありません。</p>
      ) : (
        <ul>
          {events.map((ev) => (
            <li key={ev.id}>
              {ev.date} {ev.time || "時間未設定"} {ev.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
