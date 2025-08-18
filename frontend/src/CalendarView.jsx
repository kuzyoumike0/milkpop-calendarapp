import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

function CalendarView() {
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [slot, setSlot] = useState("終日");
  const [shares, setShares] = useState([]);

  // データ取得
  useEffect(() => {
    axios.get("/api/shares").then((res) => setShares(res.data));
  }, []);

  // 追加処理
  const addShare = () => {
    if (!title) return;
    axios.post("/api/shares", {
      date: date.toISOString().slice(0, 10),
      slot,
      title,
    }).then((res) => {
      setShares([...shares, res.data]);
      setTitle("");
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>📅 共有カレンダー</h1>
      <Calendar value={date} onChange={setDate} />

      <div style={{ marginTop: 20 }}>
        <label>
          区分：
          <select value={slot} onChange={(e) => setSlot(e.target.value)}>
            <option value="終日">終日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
          </select>
        </label>
        <input
          type="text"
          placeholder="予定タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={addShare}>追加</button>
      </div>

      <h2>予定一覧</h2>
      <ul>
        {shares.map((s) => (
          <li key={s.id}>
            {s.date} [{s.slot}] - {s.title}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => {
            const url = window.location.href + "?share=" + Date.now();
            alert("共有リンク: " + url);
          }}
        >
          共有リンクを発行
        </button>
      </div>
    </div>
  );
}

export default CalendarView;
