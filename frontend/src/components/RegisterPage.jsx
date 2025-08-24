import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Holidays from "date-holidays";
import "../index.css";

// ==== ヘルパー ====
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// ==== カレンダーセル ====
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [title, setTitle] = useState("");
  const [selectionType, setSelectionType] = useState("multiple");
  const [selectedDates, setSelectedDates] = useState([]);
  const [range, setRange] = useState({ start: null, end: null });
  const [holidays, setHolidays] = useState([]); // {date, name}

  const [timeType, setTimeType] = useState("allday");
  const [timeRange, setTimeRange] = useState({ start: "09:00", end: "18:00" });

  // ==== 日本の祝日を取得 ====
  useEffect(() => {
    const hd = new Holidays("JP");
    const yearHolidays = hd.getHolidays(currentYear).map((h) => ({
      date: new Date(h.date),
      name: h.name,
    }));
    setHolidays(yearHolidays);
  }, [currentYear]);

  const handleDateClick = (date) => {
    if (selectionType === "multiple") {
      setSelectedDates((prev) =>
        prev.some((d) => d.getTime() === date.getTime())
          ? prev.filter((d) => d.getTime() !== date.getTime())
          : [...prev, date]
      );
    } else if (selectionType === "range") {
      if (!range.start || (range.start && range.end)) {
        setRange({ start: date, end: null });
      } else if (range.start && !range.end) {
        if (date < range.start) {
          setRange({ start: date, end: range.start });
        } else {
          setRange({ ...range, end: date });
        }
      }
    }
  };

  const isDateSelected = (date) => {
    if (selectionType === "multiple") {
      return selectedDates.some((d) => d.getTime() === date.getTime());
    } else if (selectionType === "range") {
      if (range.start && range.end) {
        return date >= range.start && date <= range.end;
      }
      return range.start && date.getTime() === range.start.getTime();
    }
    return false;
  };

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
    const payload =
      selectionType === "multiple"
        ? { id: scheduleId, title, dates: selectedDates, timeType, timeRange }
        : { id: scheduleId, title, range, timeType, timeRange };

    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    navigate(`/share/${scheduleId}`);
  };

  return (
    <div className="register-page">
      {/* ===== ヘッダー ===== */}
      <header className="register-header">
        <h1>MilkPOP Calendar</h1>
      </header>

      {/* ===== メインカード ===== */}
      <main className="register-card">
        <h2>日程登録</h2>

        <form onSubmit={handleSubmit}>
          {/* タイトル入力 */}
          <input
            type="text"
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-title short"
          />

          {/* 複数/範囲選択 */}
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <label style={{ marginRight: "1rem" }}>
              <input
                type="radio"
                value="multiple"
                checked={selectionType === "multiple"}
                onChange={(e) => setSelectionType(e.target.value)}
              />
              複数選択
            </label>
            <label>
              <input
                type="radio"
                value="range"
                checked={selectionType === "range"}
                onChange={(e) => setSelectionType(e.target.value)}
              />
              範囲選択
            </label>
          </div>

          {/* ==== カレンダー ==== */}
          <div className="calendar">
            <div className="calendar-header">
              <button
                type="button"
                className="nav-button"
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
                className="nav-button"
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

          {/* ==== 時間帯 ==== */}
          <div className="time-card">
            <p className="font-semibold">時間帯を選択してください:</p>
            <div>
              <label>
                <input
                  type="radio"
                  value="allday"
                  checked={timeType === "allday"}
                  onChange={(e) => setTimeType(e.target.value)}
                />
                全日
              </label>
              <br />
              <label>
                <input
                  type="radio"
                  value="daytime"
                  checked={timeType === "daytime"}
                  onChange={(e) => setTimeType(e.target.value)}
                />
                昼（09:00〜18:00）
              </label>
              <br />
              <label>
                <input
                  type="radio"
                  value="night"
                  checked={timeType === "night"}
                  onChange={(e) => setTimeType(e.target.value)}
                />
                夜（18:00〜23:59）
              </label>
              <br />
              <label>
                <input
                  type="radio"
                  value="custom"
                  checked={timeType === "custom"}
                  onChange={(e) => setTimeType(e.target.value)}
                />
                時刻指定
              </label>
            </div>

            {timeType === "custom" && (
              <div style={{ marginTop: "0.5rem" }}>
                <input
                  type="time"
                  value={timeRange.start}
                  onChange={(e) =>
                    setTimeRange({ ...timeRange, start: e.target.value })
                  }
                />
                <span>〜</span>
                <input
                  type="time"
                  value={timeRange.end}
                  onChange={(e) =>
                    setTimeRange({ ...timeRange, end: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          <button type="submit" className="share-button">
            共有リンクを発行
          </button>
        </form>
      </main>
    </div>
  );
}
