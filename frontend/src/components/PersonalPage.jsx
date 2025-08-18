import React, { useState, useEffect } from "react";
import axios from "axios";

export default function PersonalPage() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    axios.get("/api/personal").then((res) => setEvents(res.data));
  }, []);

  const addEvent = async () => {
    if (!title) return;
    await axios.post("/api/personal", { title });
    setEvents([...events, { title }]);
    setTitle("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>個人スケジュール</h2>
      <input
        placeholder="予定名"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={addEvent}>追加</button>
      <ul>
        {events.map((ev, i) => (
          <li key={i}>{ev.title}</li>
        ))}
      </ul>
    </div>
  );
}
