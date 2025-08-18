import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function SharePage() {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [username, setUsername] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("13:00");
  const [title, setTitle] = useState("");

  // データ取得
  useEffect(() => {
    fetch(`/api/share/${id}`)
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, [id]);

  // 予定追加
  const addEvent = async () => {
    if (!username || !title || !startTime || !endTime) {
      alert("ユーザー名、開始時間、終了時間、タイトルを入力してください");
      return;
    }
    await fetch(`/api/share/${id}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, start_time: startTime, end_time: endTime, title }),
    });
    setUsername("");
    setStartTime("12:00");
    setEndTime("13:00");
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
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={{ marginRight: "5px" }}
        />
        <span>〜</span>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          style={{ marginLeft: "5px", marginRight: "10px" }}
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
            <strong>{e.start_time}〜{e.end_time}</strong> — {e.username} : {e.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
