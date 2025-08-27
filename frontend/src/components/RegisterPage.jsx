// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import { useNavigate } from "react-router-dom";
import "../register.css";

const hd = new Holidays("JP");

const RegisterPage = () => {
  const [mode, setMode] = useState("single");
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const navigate = useNavigate();

  // JST の今日
  const todayJST = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );

  // 日付クリック処理
  const handleDateClick = (date) => {
    if (mode === "single") {
      setSelectedDates([date]);
    } else if (mode === "multi") {
      if (selectedDates.some((d) => d.toDateString() === date.toDateString())) {
        setSelectedDates(selectedDates.filter((d) => d.toDateString() !== date.toDateString()));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else if (mode === "range") {
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const range = [];
        const cur = new Date(start);
        const end = new Date(date);
        if (start <= end) {
          while (cur <= end) {
            range.push(new Date(cur));
            cur.setDate(cur.getDate() + 1);
          }
        } else {
          while (end <= cur) {
            range.push(new Date(end));
            end.setDate(end.getDate() + 1);
          }
        }
        setSelectedDates(range);
      }
    }
  };

  // 選択中か判定
  const isSelected = (date) =>
    selectedDates.some((d) => d.toDateString() === date.toDateString());

  // カレンダーの日付タイル
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      const isSunday = date.getDay() === 0;
      const isSaturday = date.getDay() === 6;
      const isToday =
        date.getFullYear() === todayJST.getFullYear() &&
        date.getMonth() === todayJST.getMonth() &&
        date.getDate() === todayJST.getDate();

      return (
        <div
          className={`${isSunday ? "sunday" : ""} 
                      ${isSaturday ? "saturday" : ""} 
                      ${holiday ? "holiday" : ""} 
                      ${isToday ? "today" : ""} 
                      ${isSelected(date) ? "selected-date" : ""}`}
        >
          {/* ✅ 日付は React-Calendar が描画するので表示しない */}
          {holiday && <div className="holiday-name">{holiday[0].name}</div>}
        </div>
      );
    }
    return null;
  };

  // 共有リンク発行
  const handleShare = () => {
    const token = Math.random().toString(36).substring(2, 10);
    const url = `${window.location.origin}/share/${token}`;
    setShareUrl(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("リンクをコピーしました！");
  };

  return (
    <div className="register-page">
      <h1 className="page-title">日程登録</h1>
      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="mode-tabs">
        <button onClick={() => setMode("single")} className={mode === "single" ? "active" : ""}>
          単日
        </button>
        <button onClick={() => setMode("multi")} className={mode === "multi" ? "active" : ""}>
          複数選択
        </button>
        <button onClick={() => setMode("range")} className={mode === "range" ? "active" : ""}>
          範囲選択
        </button>
      </div>

      <div className="calendar-container">
        <div className="calendar-box">
          <Calendar
            locale="ja-JP"
            onClickDay={handleDateClick}
            value={selectedDates}
            tileContent={tileContent}
          />
        </div>

        <div className="selected-list">
          <h3>選択中の日程</h3>
          {selectedDates.map((d, i) => (
            <div key={i} className="selected-card">
              <span className="date-badge">
                {d.toISOString().split("T")[0]}
              </span>
              <div className="time-buttons">
                <button className="time-btn active">終日</button>
                <button className="time-btn">午前</button>
                <button className="time-btn">午後</button>
                <button className="time-btn">時間指定</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="save-btn" onClick={handleShare}>
        共有リンクを発行
      </button>

      {shareUrl && (
        <div className="share-link-box">
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            {shareUrl}
          </a>
          <button className="copy-btn" onClick={handleCopy}>
            コピー
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
