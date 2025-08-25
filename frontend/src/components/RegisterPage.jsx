// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Holidays from "date-holidays";
import "../common.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [timeRanges, setTimeRanges] = useState({});

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handleDateClick = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    if (selectionMode === "multiple") {
      setSelectedDates((prev) =>
        prev.includes(dateStr)
          ? prev.filter((d) => d !== dateStr)
          : [...prev, dateStr]
      );
    } else if (selectionMode === "range") {
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        setSelectedDates([dateStr]);
      } else if (selectedDates.length === 1) {
        const start = new Date(selectedDates[0]);
        const end = new Date(dateStr);
        const range = [];
        const step = start < end ? 1 : -1;
        for (
          let d = new Date(start);
          step > 0 ? d <= end : d >= end;
          d.setDate(d.getDate() + step)
        ) {
          range.push(d.toISOString().split("T")[0]);
        }
        setSelectedDates(range);
      }
    }
  };

  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;

      const isSelected = selectedDates.includes(dateStr);
      const isHoliday = hd.isHoliday(new Date(currentYear, currentMonth, day));

      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? "selected" : ""} ${
            isHoliday ? "holiday" : ""
          }`}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="register-page">
      <h2>日程登録</h2>

      {/* ✅ タイトルをカレンダー上に置く */}
      <div className="calendar-title-input">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 選択方法ラジオボタン */}
      <div className="selection-mode">
        <label
          className={`mode-option ${
            selectionMode === "multiple" ? "active" : ""
          }`}
        >
          <input
            type="radio"
            value="multiple"
            checked={selectionMode === "multiple"}
            onChange={() => setSelectionMode("multiple")}
          />
          複数選択
        </label>
        <label
          className={`mode-option ${
            selectionMode === "range" ? "active" : ""
          }`}
        >
          <input
            type="radio"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => setSelectionMode("range")}
          />
          範囲選択
        </label>
      </div>

      {/* ✅ カレンダーと選択リストを横並び */}
      <div className="calendar-layout">
        <div className="calendar">
          <div className="calendar-header">
            <button onClick={() => setCurrentMonth((m) => m - 1)}>◀</button>
            <span>
              {currentYear}年 {currentMonth + 1}月
            </span>
            <button onClick={() => setCurrentMonth((m) => m + 1)}>▶</button>
          </div>
          <div className="calendar-grid">{renderCalendar()}</div>
        </div>

        <div className="selected-list">
          <h3>選択した日程</h3>
          <ul>
            {selectedDates.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
