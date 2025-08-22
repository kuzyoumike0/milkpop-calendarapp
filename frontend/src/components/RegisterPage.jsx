import React, { useState } from "react";
import "../index.css";
import Holidays from "date-holidays";

// 祝日ライブラリを初期化（日本）
const hd = new Holidays("JP");

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [selectionMode, setSelectionMode] = useState("range"); // "range" or "multiple"
  const [selectedDates, setSelectedDates] = useState([]);
  const [rangeStart, setRangeStart] = useState(null);

  // 月の日付を生成
  const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return { firstDay, lastDay, days };
  };

  const { firstDay, lastDay, days } = getDaysInMonth(currentYear, currentMonth);

  // 日付クリック処理
  const handleDateClick = (date) => {
    if (selectionMode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
        setSelectedDates([date]);
      } else {
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;
        const range = [];
        let d = new Date(start);
        while (d <= end) {
          range.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }
        setSelectedDates(range);
        setRangeStart(null);
      }
    } else if (selectionMode === "multiple") {
      const exists = selectedDates.some(
        (d) => d.toDateString() === date.toDateString()
      );
      if (exists) {
        // 解除
        setSelectedDates(
          selectedDates.filter((d) => d.toDateString() !== date.toDateString())
        );
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    }
  };

  // 選択状態を判定
  const isSelected = (date) => {
    return selectedDates.some((d) => d.toDateString() === date.toDateString());
  };

  // 祝日判定
  const isHoliday = (date) => {
    return hd.isHoliday(date);
  };

  return (
    <div className="card">
      <h2 className="page-title">日程登録ページ</h2>

      {/* カレンダー操作 */}
      <div className="calendar-controls">
        <button
          onClick={() =>
            setCurrentMonth(
              currentMonth === 0 ? 11 : currentMonth - 1
            ) || setCurrentYear(currentMonth === 0 ? currentYear - 1 : currentYear)
          }
        >
          ←
        </button>
        <span>
          {currentYear}年 {currentMonth + 1}月
        </span>
        <button
          onClick={() =>
            setCurrentMonth(
              currentMonth === 11 ? 0 : currentMonth + 1
            ) || setCurrentYear(currentMonth === 11 ? currentYear + 1 : currentYear)
          }
        >
          →
        </button>
      </div>

      {/* カレンダー */}
      <div className="calendar-grid">
        {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
          <div key={d} className="calendar-header">
            {d}
          </div>
        ))}

        {/* 空白 */}
        {Array(firstDay.getDay())
          .fill(null)
          .map((_, idx) => (
            <div key={`empty-${idx}`} className="calendar-cell empty"></div>
          ))}

        {/* 日付セル */}
        {days.map((date) => {
          const selected = isSelected(date);
          const holiday = isHoliday(date);
          return (
            <div
              key={date.toDateString()}
              className={`calendar-cell ${selected ? "selected" : ""} ${
                holiday ? "holiday" : ""
              }`}
              onClick={() => handleDateClick(date)}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      {/* モード切替 */}
      <div className="calendar-mode">
        <label>
          <input
            type="radio"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => {
              setSelectionMode("range");
              setSelectedDates([]);
            }}
          />
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={selectionMode === "multiple"}
            onChange={() => {
              setSelectionMode("multiple");
              setSelectedDates([]);
            }}
          />
          複数選択
        </label>
      </div>
    </div>
  );
};

export default RegisterPage;
