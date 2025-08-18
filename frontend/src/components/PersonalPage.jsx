import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PersonalPage() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    axios.get("/api/events").then((res) => setEvents(res.data));
  }, []);

  const addEvent = async () => {
    const res = await axios.post("/api/events", { title, date });
    setEvents([res.data, ...events]);
    setTitle("");
    setDate("");
  };

  return (
    <div>
      <h2>個人予定</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="タイトル" />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={addEvent}>追加</button>
      <ul>
        {events.map((e) => (
          <li key={e.id}>
            {e.date} - {e.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
