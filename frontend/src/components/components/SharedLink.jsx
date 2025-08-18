import React, { useState } from "react";
import { useParams } from "react-router-dom";

export default function SharedLink() {
  const { linkId } = useParams();
  const [events, setEvents] = useState([]);
  const [username, setUsername] = useState("");
  const [event, setEvent] = useState("");
  const [time, setTime] = useState("");

  const addEvent = () => {
    if (!event || !username) return;
    const newEvent = { username, event, time };
    const updated = [...events, newEvent].sort((a, b) =>
      (a.time || "").localeCompare(b.time || "")
    );
    setEvents(updated);
    setEvent("");
    setTime("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🔗 共有リンクページ</h1>
      <p>リンクID: {linkId}</p>

      <div>
        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
            {e.username}：{e.event}
          </li>
        ))}
      </ul>
    </div>
  );
}
