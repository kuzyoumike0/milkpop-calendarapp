import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [shareLink, setShareLink] = useState("");
  const [message, setMessage] = useState("");

  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("21:00");
  const [specialSlot, setSpecialSlot] = useState(""); // 全日・昼・夜

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleDateClick = (date) => {
    const dateStr = formatDate(date);
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const handleCreateLink = async () => {
    if (!title.trim()) {
      setMessage("❌ タイトルを入力してください");
      return;
    }
    if (selectedDates.length === 0) {
      setMessage("❌ 日付を選択してください");
      return;
    }

    // specialSlotが選ばれていればそれを優先
    let timeslot = "";
    if (specialSlot) {
      timeslot = specialSlot;
    } else {
      timeslot = `${startTime}-${endTime}`;
    }

    try {
      const res = await axios.post("/api/create-link", {
        title,
        dates: selectedDates.map((d) => ({
          date: d,
          timeslot,
        })),
      });
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
    if (selectedDates.includes(dateStr)) {
      return "selected-date";
    }
    return null;
  };

  // 時間リスト（1:00～24:00）
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const h = String(i + 1).padStart(2, "0");
    return `${h}:00`;
  });

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

      {/* カレンダー */}
      <Calendar onClickDay={handleDateClick} tileClassName={tileClassName} />

      {/* 特別枠 or 時間帯選択 */}
      <div style={{ marginTop: "15px" }}>
        <label>時間帯: </label>
        <select
          value={specialSlot}
          onChange={(e) => {
            setSpecialSlot(e.target.value);
          }}
          style={{ marginRight: "10px" }}
        >
          <option value="">カスタム時間を選択</option>
          <option value="全日">全日（終日）</option>
          <option value="昼">昼（12:00-18:00）</option>
          <option value="夜">夜（18:00-24:00）</option>
        </select>

        {!specialSlot && (
          <>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            ～
            <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <button
        onClick={handleCreateLink}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
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
