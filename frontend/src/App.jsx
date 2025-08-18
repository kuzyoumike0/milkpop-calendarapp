import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function SharePage() {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [username, setUsername] = useState("");
  const [time, setTime] = useState("12:00");
  const [title, setTitle] = useState("");

  // データ取得
  useEffect(() => {
    fetch(`/api/share/${id}`)
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, [id]);

  // 予定追加
  const addEvent = async () => {
    if (!username || !title || !time) {
      alert("ユーザー名、時間、タイトルを入力してください");
      return;
    }
    await fetch(`/api/share/${id}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, time, title }),
    });
    setUsername("");
    setTime("12:00");
    setTitle("");
    // 再読み込み
    const updated = await fetch(`/api/share/${id}`).then((res) => res.json());
    setEvents(updated);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="予定内容"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button onClick={addEvent}>追加</button>
      </div>

      <ul>
        {events.map((e, i) => (
          <li key={i}>
            <strong>{e.time}</strong> — {e.username} : {e.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
