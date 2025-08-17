import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [shares, setShares] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    axios.get("/api/shares").then((res) => setShares(res.data));
  }, []);

  const addShare = () => {
    if (!title || !date) return;

    axios.post("/api/shares", { title, date }).then((res) => {
      setShares([...shares, res.data]);
      setTitle("");
      setDate("");
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>📅 共有カレンダー</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="予定タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={addShare}>追加</button>
      </div>

      <ul>
        {shares.map((s) => (
          <li key={s.id}>
            {s.date} - {s.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
