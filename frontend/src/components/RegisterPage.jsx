// frontend/src/pages/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const RegisterPage = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [viewDate, setViewDate] = useState(new Date());
  const [selectMode, setSelectMode] = useState("multiple"); // "multiple" or "range"

  // 📌 日付クリック
  const handleDateClick = (date) => {
    if (selectMode === "multiple") {
      if (selectedDates.find((d) => d.getTime() === date.getTime())) {
        setSelectedDates(selectedDates.filter((d) => d.getTime() !== date.getTime()));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else if (selectMode === "range") {
      if (selectedDates.length === 0 || selectedDates.length > 1) {
        setSelectedDates([date]);
      } else {
        const start = selectedDates[0];
        if (date < start) {
          setSelectedDates([date, start]);
        } else {
          setSelectedDates([start, date]);
        }
      }
    }
  };

  // 📌 月切り替え
  const handlePrevMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setViewDate(newDate);
  };
  const handleNextMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setViewDate(newDate);
  };

  // 📌 表示するカレンダーセル
  const generateCalendarCells = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const cells = [];
    let current = new Date(firstDay);
    current.setDate(current.getDate() - current.getDay()); // 日曜始まり

    while (current <= lastDay || current.getDay() !== 0) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const copyDate = new Date(current);
        const isSelected = selectedDates.some(
          (d) =>
            (selectMode === "range" && selectedDates.length === 2
              ? d >= selectedDates[0] && d <= selectedDates[1]
              : d.getTime() === copyDate.getTime())
        );
        const isToday =
          copyDate.toDateString() === new Date().toDateString() &&
          copyDate.getMonth() === month;

        week.push(
          <div
            key={copyDate.toISOString()}
            className={`calendar-cell 
              ${isToday ? "today" : ""} 
              ${isSelected ? "selected" : ""}
              ${copyDate.getMonth() !== month ? "other-month" : ""}`}
            onClick={() => handleDateClick(copyDate)}
          >
            {copyDate.getMonth() === month ? copyDate.getDate() : ""}
          </div>
        );
        current.setDate(current.getDate() + 1);
      }
      cells.push(
        <div className="calendar-row" key={current.toISOString()}>
          {week}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="register-page">
      <div className="register-layout">
        {/* ===== 左側 カレンダーエリア ===== */}
        <div className="calendar-section">
          {/* タイトル入力 */}
          <input
            type="text"
            className="input-field"
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* ラジオボタン */}
          <div className="radio-options">
            <label className="radio-label">
              <input
                type="radio"
                name="selectMode"
                value="multiple"
                checked={selectMode === "multiple"}
                onChange={() => setSelectMode("multiple")}
              />
              <span className="custom-radio"></span>
              複数選択
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="selectMode"
                value="range"
                checked={selectMode === "range"}
                onChange={() => setSelectMode("range")}
              />
              <span className="custom-radio"></span>
              範囲選択
            </label>
          </div>

          {/* 月切り替えナビ */}
          <div className="calendar-nav">
            <button className="nav-btn" onClick={handlePrevMonth}>
              &lt;
            </button>
            <span className="calendar-title">
              {viewDate.getFullYear()}年 {viewDate.getMonth() + 1}月
            </span>
            <button className="nav-btn" onClick={handleNextMonth}>
              &gt;
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="calendar-row">
            {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}
          </div>

          {/* カレンダー本体 */}
          <div className="custom-calendar">{generateCalendarCells()}</div>
        </div>

        {/* ===== 右側 選択した日程リスト ===== */}
        <div className="schedule-section">
          <h3>選択中の日程</h3>
          {selectedDates.length === 0 ? (
            <p>日付を選択してください</p>
          ) : (
            <ul>
              {selectMode === "range" && selectedDates.length === 2 ? (
                <li>
                  {selectedDates[0].toLocaleDateString()} 〜{" "}
                  {selectedDates[1].toLocaleDateString()}
                </li>
              ) : (
                selectedDates.map((d, i) => (
                  <li key={i}>{d.toLocaleDateString()}</li>
                ))
              )}
            </ul>
          )}
          <button className="save-btn">共有リンク発行</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
