import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./sharepage.css"; // グラスモーフィズム風デザイン用

export default function SharePage() {
  const { shareId } = useParams();
  const [events, setEvents] = useState([]);
  const [username, setUsername] = useState("");
  const [dates, setDates] = useState([]);

  // 予定一覧を取得
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

  // 新しい予定を登録
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

  return (
    <div className="share-container">
      <div className="share-card">
        <h2>共有スケジュール</h2>

        {/* 入力フォーム */}
        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="share-input"
        />

        <Calendar
          onChange={(val) =>
            Array.isArray(val) ? setDates(val.map((d) => d.toISOString().slice(0, 10))) : setDates([val.toISOString().slice(0, 10)])
          }
          selectRange={true}
          value={null}
        />

        <button onClick={handleSubmit} className="share-btn">
          登録
        </button>

        {/* 登録済み予定一覧 */}
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
