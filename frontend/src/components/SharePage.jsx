import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SharePage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("/api/shared").then((res) => setEvents(res.data));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🌐 共有カレンダー</h2>
      {events.length === 0 ? (
        <p>まだ予定はありません。</p>
      ) : (
        <ul>
          {events.map((ev) => (
            <li key={ev.id}>
              {ev.date} {ev.title} ({ev.time || "時間未設定"})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
