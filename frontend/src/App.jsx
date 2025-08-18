import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import axios from "axios";

// ===== 個人スケジュールページ =====
function SchedulePage() {
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [events, setEvents] = useState([]);
  const [shareUrl, setShareUrl] = useState("");

  // スケジュール取得
  useEffect(() => {
    axios.get("/api/schedules").then((res) => setEvents(res.data));
  }, []);

  // スケジュール追加
  const addSchedule = async () => {
    if (!username || !title || !date) {
      alert("全て入力してください");
      return;
    }
    await axios.post("/api/schedules", { username, title, date, time_slot: timeSlot });
    const res = await axios.get("/api/schedules");
    setEvents(res.data);
    setTitle("");
  };

  // 共有リンク発行
  const generateShareLink = async () => {
    const res = await axios.post("/api/share");
    const { shareId } = res.data;
    const url = `${window.location.origin}/share/${shareId}`;
    setShareUrl(url);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 個人スケジュール管理</h2>
      <input
        type="text"
        placeholder="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="予定タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
        <option value="全日">全日</option>
        <option value="昼">昼</option>
        <option value="夜">夜</option>
      </select>
      <button onClick={addSchedule}>追加</button>

      <h3>📌 登録済みスケジュール</h3>
      <ul>
        {events.map((e, i) => (
          <li key={i}>
            {e.date} [{e.time_slot}] {e.username} - {e.title}
          </li>
        ))}
      </ul>

      <h3>🔗 共有リンク</h3>
      <button onClick={generateShareLink}>共有リンクを発行</button>
      {shareUrl && (
        <p>
          <a href={shareUrl} target="_blank" rel="noreferrer">
            {shareUrl}
          </a>
        </p>
      )}
    </div>
  );
}

// ===== 共有ページ =====
function SharePage() {
  const { shareId } = useParams();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios
      .get(`/api/share/${shareId}`)
      .then((res) => setEvents(res.data))
      .catch(() => alert("リンクが無効です"));
  }, [shareId]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📤 共有スケジュール</h2>
      <ul>
        {events.map((e, i) => (
          <li key={i}>
            {e.date} [{e.time_slot}] {e.username} - {e.title}
          </li>
        ))}
      </ul>
      <Link to="/">← 戻る</Link>
    </div>
  );
}

// ===== ルーティング =====
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SchedulePage />} />
        <Route path="/share/:shareId" element={<SharePage />} />
      </Routes>
    </Router>
  );
}
