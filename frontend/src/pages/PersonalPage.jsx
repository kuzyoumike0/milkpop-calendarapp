import React, { useState } from "react";
import axios from "axios";

export default function PersonalPage() {
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !title.trim()) return;
    const newEvent = { id: Date.now(), date, title };
    setEvents([...events, newEvent]);
    setTitle("");
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#fafafa", minHeight: "100vh" }}>
      <header style={{ background: "#ff6f61", color: "#fff", padding: "1rem", textAlign: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
        MilkpopCalendar
      </header>

      <main style={{ maxWidth: 700, margin: "2rem auto", padding: "1.5rem", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: "#ff6f61", marginBottom: "1rem" }}>個人スケジュール</h2>

        <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: ".5rem", marginRight: ".5rem" }} />
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="予定を入力" style={{ padding: ".5rem", marginRight: ".5rem" }} />
          <button type="submit" style={{ padding: ".5rem 1rem", background: "#ff6f61", color: "#fff", border: "none", borderRadius: "6px" }}>追加</button>
        </form>

        <ul>
          {events.map(ev => (
            <li key={ev.id}>{ev.date} - {ev.title}</li>
          ))}
        </ul>
      </main>
    </div>
  );
}
