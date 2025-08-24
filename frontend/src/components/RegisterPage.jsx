import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Holidays from "date-holidays";
import "../index.css";

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

const CalendarCell = ({
  date,
  isSelected,
  onClick,
  isHoliday,
  holidayName,
  isSaturday,
  isSunday,
  isToday,
}) => {
  let cellClass = "day-cell";
  if (isHoliday) cellClass += " calendar-holiday";
  else if (isSunday) cellClass += " calendar-sunday";
  else if (isSaturday) cellClass += " calendar-saturday";

  if (isSelected) cellClass += " selected";
  else if (isToday) cellClass += " calendar-today";

  return (
    <div
      onClick={() => onClick(date)}
      title={holidayName || ""}
      className={cellClass}
    >
      <span>{date.getDate()}</span>
      {holidayName && <span className="holiday-name">{holidayName}</span>}
    </div>
  );
};

export function RegisterPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const hd = new Holidays("JP");
    const yearHolidays = hd.getHolidays(currentYear).map((h) => ({
      date: new Date(h.date),
      name: h.name,
    }));
    setHolidays(yearHolidays);
  }, [currentYear]);

  const handleDateClick = (date) => {
    setSelectedDates((prev) =>
      prev.some((d) => d.getTime() === date.getTime())
        ? prev.filter((d) => d.getTime() !== date.getTime())
        : [...prev, date]
    );
  };

  const isDateSelected = (date) =>
    selectedDates.some((d) => d.getTime() === date.getTime());

  const getHolidayInfo = (date) => {
    const holiday = holidays.find(
      (h) =>
        h.date.getFullYear() === date.getFullYear() &&
        h.date.getMonth() === date.getMonth() &&
        h.date.getDate() === date.getDate()
    );
    return holiday ? holiday.name : null;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(currentYear, currentMonth, d));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const scheduleId = uuidv4();
    const payload = {
      id: scheduleId,
      title,
      dates: selectedDates,
    };
    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    navigate(`/share/${scheduleId}`);
  };

  return (
    <div className="register-page">
      <main className="register-card">
        {/* 左側カレンダー */}
        <div className="calendar-section">
          <h2 className="page-title">日程登録</h2>
          <div className="title-input-wrapper">
            <input
              type="text"
              placeholder="タイトルを入力"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-title short"
            />
          </div>

          {/* ==== カレンダー ==== */}
          <div className="calendar">
            <div className="calendar-header">
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth((prev) => {
                    if (prev === 0) {
                      setCurrentYear((y) => y - 1);
                      return 11;
                    }
                    return prev - 1;
                  })
                }
              >
                ←
              </button>
              <h3 className="month-title">
                {currentYear}年 {currentMonth + 1}月
              </h3>
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth((prev) => {
                    if (prev === 11) {
                      setCurrentYear((y) => y + 1);
                      return 0;
                    }
                    return prev + 1;
                  })
                }
              >
                →
              </button>
            </div>

            <div className="week-header">
              {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="calendar-grid">
              {calendarDays.map((date, i) =>
                date ? (
                  <CalendarCell
                    key={i}
                    date={date}
                    isSelected={isDateSelected(date)}
                    onClick={handleDateClick}
                    isHoliday={!!getHolidayInfo(date)}
                    holidayName={getHolidayInfo(date)}
                    isSaturday={date.getDay() === 6}
                    isSunday={date.getDay() === 0}
                    isToday={
                      date.getFullYear() === today.getFullYear() &&
                      date.getMonth() === today.getMonth() &&
                      date.getDate() === today.getDate()
                    }
                  />
                ) : (
                  <div key={i}></div>
                )
              )}
            </div>
          </div>
        </div>

        {/* 右側リスト */}
        <div className="options-section">
          <h3 style={{ color: "#ff69b4" }}>選択した日程</h3>
          <div>
            {selectedDates
              .sort((a, b) => a - b)
              .map((d, i) => (
                <div key={i} className="selected-date">
                  {d.toLocaleDateString("ja-JP")}
                </div>
              ))}
          </div>
          <button
            type="submit"
            className="share-button"
            style={{ marginTop: "1rem" }}
            onClick={handleSubmit}
          >
            共有リンクを発行
          </button>
        </div>
      </main>
    </div>
  );
}
