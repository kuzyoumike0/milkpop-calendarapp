// frontend/src/pages/RegisterPage.jsx
import React, { useState } from "react";
import "../index.css";

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("multiple");
  const [title, setTitle] = useState("");

  // 📌 月の日数を取得
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // 📌 月初の曜日
  const getStartDayOfWeek = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // 📌 前月へ
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // 📌 翌月へ
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 📌 日付クリック処理
  const handleDateClick = (day) => {
    const dateObj = new Date(currentYear, currentMonth, day);

    if (mode === "multiple") {
      const exists = selectedDates.find(
        (d) => d.toDateString() === dateObj.toDateString()
      );
      if (exists) {
        setSelectedDates(selectedDates.filter((d) => d !== exists));
      } else {
        setSelectedDates([...selectedDates, dateObj]);
      }
    }

    if (mode === "range") {
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        setSelectedDates([dateObj]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const end = dateObj;
        const range = [];
        let current = new Date(start);
        while (current <= end) {
          range.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(range);
      }
    }
  };

  // 📌 削除
  const handleDelete = (targetDate) => {
    setSelectedDates(selectedDates.filter((d) => d !== targetDate));
  };

  // 📌 カレンダーの日付セルを生成
  const renderCalendarCells = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const startDay = getStartDayOfWeek(currentYear, currentMonth);

    const cells = [];

    // 空白セル
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }

    // 日付セル
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const isToday =
        today.getDate() === day &&
        today.getMonth() === currentMonth &&
        today.getFullYear() === currentYear;
      const isSelected = selectedDates.some(
        (d) => d.toDateString() === dateObj.toDateString()
      );

      cells.push(
        <div
          key={day}
          className={`calendar-cell 
            ${isToday ? "today" : ""} 
            ${isSelected ? "selected" : ""}`}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="register-page">
      <div className="register-layout">
        {/* === 左 === */}
        <div className="calendar-section">
          {/* タイトル */}
          <input
            type="text"
            placeholder="タイトルを入力"
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* ラジオボタン */}
          <div className="radio-options-left">
            <label className="radio-label">
              <input
                type="radio"
                name="mode"
                value="multiple"
                checked={mode === "multiple"}
                onChange={() => setMode("multiple")}
              />
              <span className="custom-radio"></span> 複数選択
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="mode"
                value="range"
                checked={mode === "range"}
                onChange={() => setMode("range")}
              />
              <span className="custom-radio"></span> 範囲選択
            </label>
          </div>

          {/* ナビ */}
          <div className="calendar-nav">
            <button onClick={handlePrevMonth} className="nav-btn">←</button>
            <span className="calendar-title">
              {currentYear}年 {currentMonth + 1}月
            </span>
            <button onClick={handleNextMonth} className="nav-btn">→</button>
          </div>

          {/* カレンダー */}
          <div className="custom-calendar">
            <div className="calendar-day-header">日</div>
            <div className="calendar-day-header">月</div>
            <div className="calendar-day-header">火</div>
            <div className="calendar-day-header">水</div>
            <div className="calendar-day-header">木</div>
            <div className="calendar-day-header">金</div>
            <div className="calendar-day-header">土</div>
            {renderCalendarCells()}
          </div>
        </div>

        {/* === 右 === */}
        <div className="schedule-section">
          <h3>選択中の日程</h3>
          {selectedDates.length === 0 ? (
            <p>日付を選択してください</p>
          ) : (
            <ul>
              {selectedDates.map((d, idx) => (
                <li key={idx} className="schedule-card">
                  <span>
                    {d.getFullYear()}/{d.getMonth() + 1}/{d.getDate()}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(d)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button className="save-btn">共有リンク発行</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
