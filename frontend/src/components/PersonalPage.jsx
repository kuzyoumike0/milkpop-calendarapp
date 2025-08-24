import React, { useState } from "react";
import Holidays from "date-holidays";
import "../index.css";

const PersonalPage = () => {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeRange, setTimeRange] = useState("allday");

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const hd = new Holidays("JP");

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handleDateClick = (day) => {
    const date = `${currentYear}-${currentMonth + 1}-${day}`;
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="day-cell empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const holiday = hd.isHoliday(date);
      const formattedDate = `${currentYear}-${currentMonth + 1}-${day}`;
      const isSelected = selectedDates.includes(formattedDate);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`day-cell ${isSelected ? "selected" : ""} ${
            holiday ? "calendar-holiday" : ""
          } ${date.getDay() === 0 ? "calendar-sunday" : ""} ${
            date.getDay() === 6 ? "calendar-saturday" : ""
          } ${isToday ? "calendar-today" : ""}`}
          onClick={() => handleDateClick(day)}
        >
          <span>{day}</span>
          {holiday && <small className="holiday-name">{holiday[0].name}</small>}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="page-container">
      <h2 className="page-title">個人日程登録</h2>

      <div className="input-card">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />
        <textarea
          placeholder="メモを入力"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="title-input"
          style={{ height: "80px", marginTop: "1rem" }}
        />

        <div className="radio-group fancy-radio">
          <label>
            <input
              type="radio"
              value="allday"
              checked={timeRange === "allday"}
              onChange={() => setTimeRange("allday")}
            />
            <span className="custom-radio"></span>
            終日
          </label>
          <label>
            <input
              type="radio"
              value="day"
              checked={timeRange === "day"}
              onChange={() => setTimeRange("day")}
            />
            <span className="custom-radio"></span>
            昼
          </label>
          <label>
            <input
              type="radio"
              value="night"
              checked={timeRange === "night"}
              onChange={() => setTimeRange("night")}
            />
            <span className="custom-radio"></span>
            夜
          </label>
          <label>
            <input
              type="radio"
              value="custom"
              checked={timeRange === "custom"}
              onChange={() => setTimeRange("custom")}
            />
            <span className="custom-radio"></span>
            時間指定
          </label>
        </div>
      </div>

      <div className="main-layout">
        <div className="calendar-section">
          <div className="calendar">
            <div className="calendar-header">
              <button onClick={() => setCurrentMonth(currentMonth - 1)}>←</button>
              <h3 className="month-title">
                {currentYear}年 {currentMonth + 1}月
              </h3>
              <button onClick={() => setCurrentMonth(currentMonth + 1)}>→</button>
            </div>
            <div className="week-header">
              <span>日</span><span>月</span><span>火</span>
              <span>水</span><span>木</span><span>金</span><span>土</span>
            </div>
            <div className="calendar-grid">{renderDays()}</div>
          </div>
        </div>

        <div className="options-section">
          <h3>選択した日程</h3>
          <ul>
            {selectedDates.map((d, i) => (
              <li key={i} className="selected-date">{d} ({timeRange})</li>
            ))}
          </ul>
          <button className="share-button fancy">💾 保存</button>
        </div>
      </div>
    </div>
  );
};

export default PersonalPage;
