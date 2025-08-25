// frontend/src/components/PersonalPage.jsx
import React, { useState } from "react";
import Holidays from "date-holidays";
import "../styles/personal.css"; // ✅ PersonalPage 専用スタイルを読み込む

const PersonalPage = () => {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [timeRanges, setTimeRanges] = useState({});

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");

  // ==== カレンダー ====
  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const isToday = (date) => {
    const d = new Date();
    return (
      d.getFullYear() === currentYear &&
      d.getMonth() === currentMonth &&
      d.getDate() === date
    );
  };

  const handleDateClick = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    if (selectionMode === "multiple") {
      if (selectedDates.includes(dateStr)) {
        setSelectedDates(selectedDates.filter((d) => d !== dateStr));
      } else {
        setSelectedDates([...selectedDates, dateStr]);
      }
    } else if (selectionMode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([dateStr]);
      } else if (selectedDates.length === 1) {
        let start = new Date(selectedDates[0]);
        let end = new Date(dateStr);
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
        setSelectedDates([dateStr]);
      }
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">個人スケジュール</h2>

      {/* タイトル入力 */}
      <div className="input-card">
        <input
          type="text"
          className="title-input"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* メモ入力 */}
      <div className="input-card">
        <textarea
          className="memo-input"
          placeholder="メモを入力"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      {/* ラジオボタン（日程選択モード） */}
      <div className="radio-group">
        <input
          type="radio"
          id="multi"
          name="mode"
          value="multiple"
          checked={selectionMode === "multiple"}
          onChange={() => setSelectionMode("multiple")}
        />
        <label htmlFor="multi">複数選択</label>
        <input
          type="radio"
          id="range"
          name="mode"
          value="range"
          checked={selectionMode === "range"}
          onChange={() => setSelectionMode("range")}
        />
        <label htmlFor="range">範囲選択</label>
      </div>

      {/* カレンダー + 選択リスト */}
      <div className="main-layout">
        {/* カレンダー */}
        <div className="calendar-section">
          <div className="calendar">
            <div className="calendar-header">
              <button onClick={prevMonth}>‹</button>
              <h3 className="month-title">
                {currentYear}年 {currentMonth + 1}月
              </h3>
              <button onClick={nextMonth}>›</button>
            </div>

            <div className="week-header">
              <div>日</div>
              <div>月</div>
              <div>火</div>
              <div>水</div>
              <div>木</div>
              <div>金</div>
              <div>土</div>
            </div>

            <div className="calendar-grid">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${String(
                  currentMonth + 1
                ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const holiday = hd.isHoliday(new Date(dateStr));
                return (
                  <div
                    key={day}
                    className={`day-cell ${
                      selectedDates.includes(dateStr) ? "selected" : ""
                    } ${isToday(day) ? "calendar-today" : ""}`}
                    onClick={() => handleDateClick(day)}
                  >
                    <span
                      className={`${
                        holiday
                          ? "calendar-holiday"
                          : new Date(dateStr).getDay() === 0
                          ? "calendar-sunday"
                          : new Date(dateStr).getDay() === 6
                          ? "calendar-saturday"
                          : ""
                      }`}
                    >
                      {day}
                    </span>
                    {holiday && (
                      <span className="holiday-name">{holiday.name}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 選択済みリスト */}
        <div className="options-section">
          <h3>登録済みスケジュール</h3>
          {selectedDates.length === 0 && <p>日付を選択してください</p>}
          {selectedDates.map((d, i) => (
            <div key={i} className="schedule-row">
              <span className="schedule-date">{d}</span>
              <select
                className="custom-dropdown short"
                value={timeRanges[d] || ""}
                onChange={(e) =>
                  setTimeRanges({ ...timeRanges, [d]: e.target.value })
                }
              >
                <option value="">時間帯</option>
                <option value="終日">終日</option>
                <option value="昼">昼</option>
                <option value="夜">夜</option>
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={`${h}:00`}>
                    {h}:00
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalPage;
