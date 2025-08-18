import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./sharepage.css";

export default function SharePage() {
  const { shareId } = useParams();
  const [events, setEvents] = useState([]);
  const [username, setUsername] = useState("");
  const [dates, setDates] = useState([]);
  const [mode, setMode] = useState("range"); // "range" or "multi"

  // イベント取得
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`/api/share/${shareId}`);
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [shareId]);

  // 登録
  const handleSubmit = async () => {
    if (!username || dates.length === 0) {
      alert("ユーザー名と日程を入力してください");
      return;
    }
    try {
      await axios.post(`/api/share/${shareId}`, { username, dates });
      setUsername("");
      setDates([]);
      fetchEvents();
    } catch (err) {
      console.error("Error saving events:", err);
    }
  };

  // カレンダーの選択処理
  const handleCalendarChange = (val) => {
    if (mode === "range") {
      if (Array.isArray(val)) {
        const selected = [];
        let d = new Date(val[0]);
        while (d <= val[1]) {
          selected.push(d.toISOString().slice(0, 10));
          d.setDate(d.getDate() + 1);
        }
        setDates(selected);
      }
    } else {
      // 複数日クリック
      const dateStr = val.toISOString().slice(0, 10);
      setDates((prev) =>
        prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
      );
    }
  };

  return (
    <div className="share-container">
      <div className="share-card">
        <h2>共有スケジュール</h2>

        <div style={{ marginBottom: "10px" }}>
          <label>
            <input
              type="radio"
              value="range"
              checked={mode === "range"}
              onChange={() => setMode("range")}
            />
            範囲選択
          </label>
          <label style={{ marginLeft: "15px" }}>
            <input
              type="radio"
              value="multi"
              checked={mode === "multi"}
              onChange={() => setMode("multi")}
            />
            複数選択
          </label>
        </div>

        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="share-input"
        />

        <Calendar
          onChange={handleCalendarChange}
          selectRange={mode === "range"}
        />

        <p>選択日: {dates.join(", ")}</p>

        <button onClick={handleSubmit} className="share-btn">
          登録
        </button>

        <div className="share-list">
          <h3>登録済み予定</h3>
          {events.length === 0 ? (
            <p>まだ予定がありません</p>
          ) : (
            <ul>
              {events.map((ev, idx) => (
                <li key={idx}>
                  <strong>{ev.event_date}</strong> : {ev.username}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
