// frontend/src/components/CalendarWithHolidays.jsx
import React, { useState } from "react";
import "../index.css";

// 祝日一覧（例：2025年）
// 実際には外部APIやDBから取得も可能
const holidays = {
  "2025-01-01": "元日",
  "2025-01-13": "成人の日",
  "2025-02-11": "建国記念の日",
  "2025-02-23": "天皇誕生日",
  "2025-03-20": "春分の日",
  "2025-04-29": "昭和の日",
  "2025-05-03": "憲法記念日",
  "2025-05-04": "みどりの日",
  "2025-05-05": "こどもの日",
  "2025-07-21": "海の日",
  "2025-08-11": "山の日",
  "2025-09-15": "敬老の日",
  "2025-09-23": "秋分の日",
  "2025-10-13": "スポーツの日",
  "2025-11-03": "文化の日",
  "2025-11-23": "勤労感謝の日",
  "2025-12-23": "天皇誕生日"
};

const CalendarWithHolidays = ({ onSelectDate }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // 月の最初と最後の日
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 曜日調整
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  // 日付セル生成
  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    days.push(new Date(year, month, d));
  }

  // 月移動
  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  return (
    <div className="calendar-container">
      {/* ツールバー */}
      <div className="calendar-toolbar">
        <button onClick={prevMonth}>◀</button>
        <h3>
          {year}年 {month + 1}月
        </h3>
        <button onClick={nextMonth}>▶</button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="calendar-grid header">
        {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
          <div key={i} className="calendar-cell weekday">
            {d}
          </div>
        ))}
      </div>

      {/* 日付 */}
      <div className="calendar-grid">
        {days.map((date, i) => {
          if (!date) return <div key={i} className="calendar-cell empty"></div>;

          const dateStr = date.toISOString().split("T")[0];
          const isHoliday = holidays[dateStr];
          const isToday =
            date.toDateString() === new Date().toDateString();

          return (
            <div
              key={i}
              className={`calendar-cell day 
                ${isHoliday ? "holiday" : ""} 
                ${isToday ? "today" : ""}`}
              onClick={() => onSelectDate && onSelectDate(date)}
              data-holiday={isHoliday || ""}
            >
              {date.getDate()}
              {isHoliday && (
                <div className="holiday-label">{holidays[dateStr]}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWithHolidays;
