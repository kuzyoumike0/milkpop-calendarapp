import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [title, setTitle] = useState(""); 
  const [selectedDates, setSelectedDates] = useState([]); 
  const [shareLink, setShareLink] = useState(""); 
  const [message, setMessage] = useState("");

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 日付クリック
  const handleDateClick = (date) => {
    const dateStr = formatDate(date);
    if (selectedDates.find((d) => d.date === dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d.date !== dateStr));
    } else {
      setSelectedDates([...selectedDates, { date: dateStr, start: "01:00", end: "24:00" }]);
    }
  };

  // 時間プルダウン生成
  const generateTimeOptions = () => {
    const options = [];
    for (let i = 1; i <= 24; i++) {
      const hour = String(i).padStart(2, "0") + ":00";
      options.push(<option key={hour} value={hour}>{hour}</option>);
    }
    return options;
  };

  // 時間変更
  const handleTimeChange = (dateStr, field, value) => {
    setSelectedDates(selectedDates.map((d) =>
      d.date === dateStr ? { ...d, [field]: value } : d
    ));
  };

  // リンク作成
  const handleCreateLink = async () => {
    if (!title.trim()) {
      setMessage("❌ タイトルを入力してください");
      return;
    }
    if (selectedDates.length === 0) {
      setMessage("❌ 日付を選択してください");
      return;
    }

    try {
      const payload = {
        title,
        dates: selectedDates.map((d) => ({
          date: d.date,
          timeslot: `${d.start}-${d.end}`,
        })),
      };

      const res = await axios.post("/api/create-link", payload);
      const url = `${window.location.origin}/link/${res.data.linkId}`;
      setShareLink(url);
      setMessage("✅ リンクを作成しました");
    } catch (err) {
      console.error("リンク作成エラー:", err);
      setMessage("❌ リンク作成に失敗しました");
    }
  };

  const tileClassName = ({ date }) => {
    const dateStr = formatDate(date);
    if (selectedDates.find((d) => d.date === dateStr)) {
      return "selected-date";
    }
    return null;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 共有リンク作成</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>タイトル: </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 飲み会調整"
          style={{ padding: "5px", width: "250px" }}
        />
      </div>

      <Calendar onClickDay={handleDateClick} tileClassName={tileClassName} />

      {/* 選択済み日付ごとの時間選択 */}
      {selectedDates.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>⏰ 時間設定</h3>
          {selectedDates.map((d) => (
            <div key={d.date} style={{ marginBottom: "10px" }}>
              <strong>{d.date}</strong>　
              開始:
              <select
                value={d.start}
                onChange={(e) => handleTimeChange(d.date, "start", e.target.value)}
              >
                {generateTimeOptions()}
              </select>
              終了:
              <select
                value={d.end}
                onChange={(e) => handleTimeChange(d.date, "end", e.target.value)}
              >
                {generateTimeOptions()}
              </select>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleCreateLink}
        style={{ marginTop: "20px", padding: "10px 20px", fontSize: "16px" }}
      >
        🔗 共有リンクを作成
      </button>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}

      {shareLink && (
        <div style={{ marginTop: "15px" }}>
          <p>
            ✅ 共有リンク:{" "}
            <a href={shareLink} target="_blank" rel="noopener noreferrer">
              {shareLink}
            </a>
          </p>
        </div>
      )}

      <style>{`
        .selected-date {
          background: #4caf50 !important;
          color: white !important;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
