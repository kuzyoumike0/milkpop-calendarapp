// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Holidays from "date-holidays";
import "../index.css";
import Dropdown from "./Dropdown";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeRanges, setTimeRanges] = useState({});
  const [shareLink, setShareLink] = useState("");
  const navigate = useNavigate();

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // 📌 日付クリック
  const handleDateClick = (day) => {
    const date = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  // 📌 時間帯変更
  const handleTimeChange = (date, value) => {
    setTimeRanges((prev) => ({
      ...prev,
      [date]: { type: value },
    }));
  };

  // 📌 カレンダー描画
  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="day-cell empty"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const holiday = hd.isHoliday(date);
      const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const isSelected = selectedDates.includes(formattedDate);
      days.push(
        <div
          key={day}
          className={`day-cell ${isSelected ? "selected" : ""} ${
            holiday ? "calendar-holiday" : ""
          }`}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  // 📌 共有リンク発行
  const generateShareLink = async () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日程を入力してください！");
      return;
    }

    const body = { title, dates: selectedDates };

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || ""}/api/schedules`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();

      if (data.share_token) {
        const url = `${window.location.origin}/share/${data.share_token}`;
        setShareLink(url);
      } else {
        alert("共有リンクの発行に失敗しました");
      }
    } catch (err) {
      console.error("共有リンク発行エラー:", err);
      alert("共有リンクの発行に失敗しました");
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録</h2>

      <div className="input-card">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />
      </div>

      {/* カレンダー＋リスト横並び */}
      <div className="main-layout">
        {/* 左：カレンダー */}
        <div className="calendar-section">
          <div className="calendar">
            <div className="calendar-header">
              <button onClick={() => setCurrentMonth(currentMonth - 1)}>←</button>
              <h3>
                {currentYear}年 {currentMonth + 1}月
              </h3>
              <button onClick={() => setCurrentMonth(currentMonth + 1)}>→</button>
            </div>
            <div className="calendar-grid">{renderDays()}</div>
          </div>
        </div>

        {/* 右：リスト */}
        <div className="options-section">
          <h3 className="mb-2">選択した日程</h3>
          <ul>
            {selectedDates.map((d, i) => (
              <li key={i} className="selected-date">
                <span>{d}</span>
                <Dropdown
                  value={timeRanges[d]?.type || "allday"}
                  onChange={(val) => handleTimeChange(d, val)}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button onClick={generateShareLink} className="share-button fancy">
        🔗 共有リンク発行
      </button>

      {shareLink && (
        <div className="share-link">
          <p>共有リンク:</p>
          <a href={shareLink} className="underline text-blue-200">
            {shareLink}
          </a>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
