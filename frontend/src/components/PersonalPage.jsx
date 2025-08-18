import React, { useState } from "react";

export default function PersonalPage() {
  const [events, setEvents] = useState([]);
  const [event, setEvent] = useState("");
  const [time, setTime] = useState("");

  const addEvent = () => {
    if (!event) return;
    const newEvent = { event, time };
    const updated = [...events, newEvent].sort((a, b) =>
      (a.time || "").localeCompare(b.time || "")
    );
    setEvents(updated);
    setEvent("");
    setTime("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>👤 個人スケジュール</h1>
      <div>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <input
          type="text"
          placeholder="予定を入力"
          value={event}
          onChange={(e) => setEvent(e.target.value)}
        />
        <button onClick={addEvent}>追加</button>
      </div>

      <h2>予定一覧</h2>
      <ul>
        {events.map((e, i) => (
          <li key={i}>
            {e.time ? `[${e.time}] ` : ""}
            {e.event}
          </li>
        ))}
      </ul>
    </div>
  );
}
