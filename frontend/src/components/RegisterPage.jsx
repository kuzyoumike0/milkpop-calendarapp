// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Holidays from "date-holidays";
import "../common.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handleDateClick = (day) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    if (selectedDates.includes(dateKey)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateKey));
    } else {
      setSelectedDates([...selectedDates, dateKey]);
    }
  };

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

      // 祝日判定
      const holiday = holidays.find(
        (h) =>
          h.date ===
          `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`
      );

      // 曜日・祝日色
      let dayClass = "calendar-day";
      if (holiday || weekday === 0) {
        dayClass += " holiday"; // 日曜 or 祝日
      } else if (weekday === 6) {
        dayClass += " saturday"; // 土曜
      }

      if (selectedDates.includes(dateKey)) {
        dayClass += " selected";
      }

      days.push(
        <div
          key={day}
          className={dayClass}
          onClick={() => handleDateClick(day)}
        >
          <div>{day}</div>
          {holiday && <div className="holiday-name">{holiday.name}</div>}
        </div>
      );
    }
    return days;
  };

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

  return (
    <div className="register-page">
      {/* タイトル入力フォーム */}
      <div className="title-input-container">
        <input
          type="text"
          placeholder="✨ スケジュールのタイトルを入力してください ✨"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />
      </div>

      {/* カレンダー */}
      <div className="calendar">
        <div className="calendar-header">
          <button className="month-nav" onClick={handlePrevMonth}>
            ◀
          </button>
          <h2>
            {currentYear}年 {currentMonth + 1}月
          </h2>
          <button className="month-nav" onClick={handleNextMonth}>
            ▶
          </button>
        </div>
        <div className="calendar-weekdays">{renderWeekdays()}</div>
        <div className="calendar-days">{renderCalendarDays()}</div>
      </div>
    </div>
  );
};

export default RegisterPage;
