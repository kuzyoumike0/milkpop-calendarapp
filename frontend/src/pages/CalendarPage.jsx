import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CalendarPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [events, setEvents] = useState([]);

  const shareId = "self"; // 自作カレンダー用

  const fetchEvents = async () => {
    const res = await axios.get(`/api/shared/${shareId}/events`, { params: { date } });
    setEvents(res.data);
  };

  useEffect(() => {
    fetchEvents();
  }, [date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await axios.post(`/api/shared/${shareId}/events`, {
      eventDate: date,
      title: title.trim(),
      slots: ["全日"],
    });
    setTitle("");
    await fetchEvents();
  };

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ textAlign: "center", color: "#4caf50" }}>自作カレンダー</h1>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="予定を入力"
          style={{ padding: ".5rem", width: "70%", marginRight: "1rem" }}
        />
        <button type="submit" style={{ padding: ".5rem 1rem", background: "#4caf50", color: "#fff", border: "none", borderRadius: "8px" }}>
          登録
        </button>
      </form>
      <h2 style={{ marginTop: "2rem" }}>{date} の予定</h2>
      <ul>
        {events.map((ev) => (
          <li key={ev.id}>{ev.title}</li>
        ))}
      </ul>
    </div>
  );
}
