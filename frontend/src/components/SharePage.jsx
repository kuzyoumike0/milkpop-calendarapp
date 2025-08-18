import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function SharePage() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    axios.get("/api/shared").then((res) => setEvents(res.data));
  }, []);

  const addEvent = async () => {
    if (!title) return;
    await axios.post("/api/shared", { title });
    setEvents([...events, { title }]);
    setTitle("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>共有カレンダー</h2>
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
      <p>
        共有リンク: <Link to="/share/abc123">/share/abc123</Link>
      </p>
    </div>
  );
}
