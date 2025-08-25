import React, { useState } from "react";
import Holidays from "date-holidays";
import "../register.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [timeRanges, setTimeRanges] = useState({});
  const [shareLink, setShareLink] = useState("");

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // ✅ 日付クリック処理
  const handleDateClick = (day) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    if (selectionMode === "multiple") {
      // 複数選択
      if (selectedDates.includes(dateKey)) {
        setSelectedDates(selectedDates.filter((d) => d !== dateKey));
      } else {
        setSelectedDates([...selectedDates, dateKey]);
      }
    } else {
      // 範囲選択
      if (selectedDates.length === 0) {
        setSelectedDates([dateKey]);
      } else if (selectedDates.length === 1) {
        let start = new Date(selectedDates[0]);
        let end = new Date(dateKey);
        if (start > end) [start, end] = [end, start];
        const range = [];
        let d = new Date(start);
        while (d <= end) {
          range.push(
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(d.getDate()).padStart(2, "0")}`
          );
          d.setDate(d.getDate() + 1);
        }
        setSelectedDates(range);
      } else {
        setSelectedDates([dateKey]);
      }
    }
  };

  // ✅ 曜日ヘッダー
  const renderWeekdays = () => {
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return weekdays.map((day, i) => (
      <div
        key={i}
        className={`calendar-weekday ${
          i === 0 ? "holiday" : i === 6 ? "saturday" : ""
        }`}
      >
        {day}
      </div>
    ));
  };

  // ✅ 日付セル
  const renderCalendarDays = () => {
    const days = [];
    const holidays = hd.getHolidays(currentYear);

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const dateObj = new Date(currentYear, currentMonth, day);
      const weekday = dateObj.getDay();

      // 祝日検索
      const holiday = holidays.find(
        (h) =>
          h.date ===
          `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`
      );

      let dayClass = "calendar-day";
      if (holiday || weekday === 0) {
        dayClass += " holiday";
      } else if (weekday === 6) {
        dayClass += " saturday";
      }
      if (selectedDates.includes(dateKey)) {
        dayClass += " selected";
      }
      if (dateObj.toDateString() === new Date().toDateString()) {
        dayClass += " today";
      }

      days.push(
        <div
          key={day}
          className={dayClass}
          onClick={() => handleDateClick(day)}
        >
          <div className="day-number">{day}</div>
          {holiday && <div className="holiday-name">{holiday.name}</div>}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="register-page">
      <div className="title-input-container">
        <input
          type="text"
          placeholder="日程登録"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />
      </div>

      <div className="selection-toggle">
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

      <div className="calendar-container">
        <div className="calendar-box">
          <div className="calendar">
            <div className="calendar-header">
              <button onClick={() =>
                setCurrentMonth(currentMonth === 0 ? 11 : currentMonth - 1)
              }>
                ◀
              </button>
              <h2>
                {currentYear}年 {currentMonth + 1}月
              </h2>
              <button onClick={() =>
                setCurrentMonth(currentMonth === 11 ? 0 : currentMonth + 1)
              }>
                ▶
              </button>
            </div>
            <div className="calendar-weekdays">{renderWeekdays()}</div>
            <div className="calendar-days">{renderCalendarDays()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
