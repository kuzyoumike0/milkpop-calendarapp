import React, { useState } from "react";

export default function App() {
  const [username, setUsername] = useState("");
  const [event, setEvent] = useState("");
  const [timeRange, setTimeRange] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`ユーザー: ${username}\n予定: ${event}\n時間: ${timeRange}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>共有カレンダー</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ユーザー名: </label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label>予定: </label>
          <input value={event} onChange={(e) => setEvent(e.target.value)} />
        </div>
        <div>
          <label>時間 (例: 13:00-15:00): </label>
          <input value={timeRange} onChange={(e) => setTimeRange(e.target.value)} />
        </div>
        <button type="submit">登録</button>
      </form>
    </div>
  );
}
