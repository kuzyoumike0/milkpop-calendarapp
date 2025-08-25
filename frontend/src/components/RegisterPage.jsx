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

  // ✅ ここに renderCalendarDays() など関数を入れる
  const renderCalendarDays = () => {
    const days = [];
    const holidays = hd.getHolidays(currentYear);

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dateObj = new Date(currentYear, currentMonth, day);
      const weekday = dateObj.getDay();

      const holiday = holidays.find(
        (h) =>
          h.date ===
          `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
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
        <div key={day} className={dayClass} onClick={() => handleDateClick(day)}>
          <div className="day-number">{day}</div>
          {holiday && <div className="holiday-name">{holiday.name}</div>}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="register-page">
      {/* UIをここに */}
    </div>
  );
};

export default RegisterPage;
