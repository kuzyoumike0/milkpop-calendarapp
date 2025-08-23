// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import "../index.css";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const dateString = clickedDate.toISOString().split("T")[0];

    if (selectedDates.includes(dateString)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateString));
    } else {
      setSelectedDates([...selectedDates, dateString]);
    }
  };

  const renderCalendar = () => {
    const weeks = [];
    let days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = new Date(currentYear, currentMonth, day)
        .toISOString()
        .split("T")[0];
      const isSelected = selectedDates.includes(dateString);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`calendar-cell ${isSelected ? "selected" : ""}`}
        >
          {day}
        </div>
      );

      if ((day + firstDay) % 7 === 0 || day === daysInMonth) {
        weeks.push(
          <div key={`week-${day}`} className="calendar-row">
            {days}
          </div>
        );
        days = [];
      }
    }
    return weeks;
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#004CA0]">
        日程登録ページ
      </h2>

      {/* カレンダー */}
      <div className="calendar-wrapper">
        <div className="calendar-nav">
          <button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="nav-btn"
          >
            ＜
          </button>
          <span className="calendar-title">
            {currentYear}年 {currentMonth + 1}月
          </span>
          <button
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="nav-btn"
          >
            ＞
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="calendar calendar-header">
          {daysOfWeek.map((day) => (
            <div key={day} className="calendar-header-cell">
              {day}
            </div>
          ))}
        </div>

        {/* カレンダー本体 */}
        <div className="calendar">{renderCalendar()}</div>
      </div>

      {/* 選択した日程リスト */}
      <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-bold mb-3">選択した日程:</h3>
        {selectedDates.length > 0 ? (
          <ul className="list-disc pl-6 space-y-1">
            {selectedDates.map((date) => (
              <li key={date}>{date}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">まだ日程が選択されていません</p>
        )}
      </div>
    </main>
  );
};

export default RegisterPage;
