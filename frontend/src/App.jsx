import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function App() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [timeslot, setTimeslot] = useState("全日");
  const [shareUrl, setShareUrl] = useState(null);

  // 日付フォーマット関数
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // イベント取得
  useEffect(() => {
    const fetchEvents = async () => {
      const formattedDate = formatDate(date);
      try {
        const res = await axios.get(`/api/schedules?date=${formattedDate}`);
        setEvents(res.data);
      } catch (err) {
        console.error("予定取得エラー:", err);
      }
    };
    fetchEvents();
  }, [date]);

  // 予定追加
  const addEvent = async () => {
    if (!username || !title) {
      alert("名前と予定を入力してください");
      return;
    }
    const formattedDate = formatDate(date);
    try {
      await axios.post("/api/schedules", {
        date: formattedDate,
        username,
        timeslot,
        title,
      });
      setTitle("");
      const res = await axios.get(`/api/schedules?date=${formattedDate}`);
      setEvents(res.data);
    } catch (err) {
      console.error("予定追加エラー:", err);
    }
  };

  // 共有リンク発行
  const generateShareLink = async () => {
    try {
      const res = await axios.post("/api/share");
      setShareUrl(window.location.origin + res.data.url);
    } catch (err) {
      console.error("共有リンク発行エラー:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>共有カレンダー</h1>

      {/* カレンダー */}
      <Calendar value={date} onChange={setDate} />

      <h2>予定の追加</h2>
      <input
        type="text"
        placeholder="名前"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <input
        type="text"
        placeholder="予定"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <select
        value={timeslot}
        onChange={(e) => setTimeslot(e.target.value)}
        style={{ marginRight: 10 }}
      >
        <option value="全日">全日</option>
        <option value="昼">昼</option>
        <option value="夜">夜</option>
      </select>
      <button onClick={addEvent}>追加</button>

      <h2>{formatDate(date)} の予定</h2>
      <ul>
        {events.map((ev) => (
          <li key={ev.id}>
            [{ev.timeslot}] {ev.username}: {ev.title}
          </li>
        ))}
      </ul>

      <h2>共有リンク</h2>
      <button onClick={generateShareLink}>共有リンクを発行</button>
      {shareUrl && (
        <p>
          共有リンク:{" "}
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            {shareUrl}
          </a>
        </p>
      )}
    </div>
  );
}
