import React, { useState } from "react";
import Holidays from "date-holidays";
import "../index.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handleDateClick = (day) => {
    const date = `${currentYear}-${currentMonth + 1}-${day}`;
    if (selectionMode === "multiple") {
      setSelectedDates((prev) =>
        prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
      );
    } else if (selectionMode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = new Date(selectedDates[0]);
        const end = new Date(date);
        if (end < start) {
          setSelectedDates([date, selectedDates[0]]);
        } else {
          setSelectedDates([selectedDates[0], date]);
        }
      } else {
        setSelectedDates([date]);
      }
    }
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const holiday = hd.isHoliday(date);
      const formattedDate = `${currentYear}-${currentMonth + 1}-${day}`;
      const isSelected =
        selectionMode === "multiple"
          ? selectedDates.includes(formattedDate)
          : selectedDates.length === 2 &&
            date >= new Date(selectedDates[0]) &&
            date <= new Date(selectedDates[1]);

      days.push(
        <div
          key={day}
          className={`calendar-cell ${isSelected ? "selected" : ""} ${
            holiday ? "holiday" : ""
          }`}
          onClick={() => handleDateClick(day)}
        >
          <span>{day}</span>
          {holiday && <small>{holiday[0].name}</small>}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録</h2>

      {/* 入力エリア */}
      <div className="input-card">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />

        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="multiple"
              checked={selectionMode === "multiple"}
              onChange={() => setSelectionMode("multiple")}
            />
            複数選択
          </label>
          <label>
            <input
              type="radio"
              value="range"
              checked={selectionMode === "range"}
              onChange={() => setSelectionMode("range")}
            />
            範囲選択
          </label>
        </div>
      </div>

      {/* カレンダー */}
      <div className="calendar-card">
        <div className="calendar-header">
          <button onClick={() => setCurrentMonth(currentMonth - 1)}>←</button>
          <h3>
            {currentYear}年 {currentMonth + 1}月
          </h3>
          <button onClick={() => setCurrentMonth(currentMonth + 1)}>→</button>
        </div>
        <div className="calendar-grid">{renderDays()}</div>
      </div>

      {/* 選択した日程 */}
      <div className="selected-card">
        <h3>選択した日程</h3>
        <ul>
          {selectedDates.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
        <button className="share-btn">✨ 共有リンクを発行 ✨</button>
      </div>

      <img src="/cat.png" alt="cat" className="cat-deco" />
    </div>
  );
};

export default RegisterPage;
