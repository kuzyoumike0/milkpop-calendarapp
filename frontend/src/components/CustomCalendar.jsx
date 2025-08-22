import React, { useState, useEffect } from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isToday } from "date-fns";
import Holidays from "date-holidays";
import ja from "date-fns/locale/ja";
import "../index.css";

const CustomCalendar = ({ selectionMode = "range", onSelectDates }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [rangeStart, setRangeStart] = useState(null);
  const hd = new Holidays("JP");

  // 月の日付を生成
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // 日付クリック処理
  const handleDateClick = (date) => {
    if (selectionMode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
        setSelectedDates([date]);
      } else {
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;

        const range = eachDayOfInterval({ start, end });
        setSelectedDates(range);
        setRangeStart(null);
      }
    } else if (selectionMode === "multiple") {
      const exists = selectedDates.some(
        (d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      );
      if (exists) {
        setSelectedDates(
          selectedDates.filter(
            (d) => format(d, "yyyy-MM-dd") !== format(date, "yyyy-MM-dd")
          )
        );
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    }
    onSelectDates && onSelectDates(selectedDates);
  };

  // 前後の月へ移動
  const changeMonth = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  return (
    <div className="calendar-container">
      {/* ヘッダー */}
      <div className="calendar-header">
        <button onClick={() => changeMonth(-1)}>＜</button>
        <h2>{format(currentMonth, "yyyy年 M月", { locale: ja })}</h2>
        <button onClick={() => changeMonth(1)}>＞</button>
      </div>

      {/* 曜日 */}
      <div className="calendar-grid calendar-weekdays">
        {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
          <div key={i} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      {/* 日付 */}
      <div className="calendar-grid">
        {daysInMonth.map((day, i) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isSelected = selectedDates.some(
            (d) => format(d, "yyyy-MM-dd") === dateStr
          );
          const holiday = hd.isHoliday(day);
          return (
            <div
              key={i}
              className={`calendar-day ${isToday(day) ? "today" : ""} ${
                isSelected ? "selected" : ""
              } ${holiday ? "holiday" : ""}`}
              onClick={() => handleDateClick(day)}
            >
              {format(day, "d")}
              {holiday && <span className="holiday-label">{holiday[0].name}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCalendar;
