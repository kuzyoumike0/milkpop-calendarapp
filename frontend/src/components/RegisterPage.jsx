import React, { useState } from "react";
import "../index.css";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day) => {
    const date = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter((d) => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">日程登録ページ</h1>

      <div className="page-container">
        {/* カレンダー部分 */}
        <div className="calendar-container card">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="イベントのタイトルを入力"
            className="input-title"
          />

          <div className="calendar-nav" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <button onClick={handlePrevMonth} className="nav-button">
              &lt;
            </button>
            <h2 className="month-title">
              {currentYear}年 {currentMonth + 1}月
            </h2>
            <button onClick={handleNextMonth} className="nav-button">
              &gt;
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="week-header">
            {daysOfWeek.map((day, i) => (
              <div key={i}>{day}</div>
            ))}
          </div>

          {/* 日付セル */}
          <div className="calendar-grid">
            {Array(startDay)
              .fill(null)
              .map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const date = `${currentYear}-${String(currentMonth + 1).padStart(
                2,
                "0"
              )}-${String(day).padStart(2, "0")}`;
              const isSelected = selectedDates.includes(date);

              return (
                <div
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`day-cell ${isSelected ? "selected" : ""}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* 選択した日程リスト */}
        <div className="selected-container card">
          <h2>選択した日程</h2>
          {selectedDates.length === 0 ? (
            <p style={{ color: "#888" }}>まだ日程が選択されていません</p>
          ) : (
            <ul>
              {selectedDates.map((date, idx) => (
                <li key={idx} className="selected-date">
                  {date}
                </li>
              ))}
            </ul>
          )}
          <button className="share-button">共有リンクを発行</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
