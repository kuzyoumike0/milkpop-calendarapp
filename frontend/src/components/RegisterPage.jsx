import React, { useState } from "react";
import "../index.css";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [savedSchedules, setSavedSchedules] = useState([]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const handleDateClick = (date) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter((d) => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleSave = () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日付を入力してください！");
      return;
    }
    setSavedSchedules([
      ...savedSchedules,
      { id: Date.now(), title, dates: selectedDates },
    ]);
    setTitle("");
    setSelectedDates([]);
  };

  const handleDelete = (id) => {
    setSavedSchedules(savedSchedules.filter((s) => s.id !== id));
  };

  return (
    <div className="register-page">
      <div className="banner">MilkPOP Calendar</div>

      <div className="register-layout">
        {/* ===== 左：カレンダー 7割 ===== */}
        <div className="calendar-section">
          <h2 className="form-title">
            {year}年 {month + 1}月
          </h2>
          <div className="calendar-nav">
            <button onClick={prevMonth}>← 前の月</button>
            <button onClick={nextMonth}>次の月 →</button>
          </div>

          {/* カレンダー */}
          <div className="calendar-grid custom-calendar">
            {daysOfWeek.map((day) => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}

            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-cell empty"></div>
            ))}

            {Array.from({ length: lastDate }).map((_, i) => {
              const date = i + 1;
              const isToday =
                year === today.getFullYear() &&
                month === today.getMonth() &&
                date === today.getDate();
              const isSelected = selectedDates.includes(date);

              return (
                <div
                  key={date}
                  className={`calendar-cell ${
                    isToday ? "today" : ""
                  } ${isSelected ? "selected" : ""}`}
                  onClick={() => handleDateClick(date)}
                >
                  {date}
                </div>
              );
            })}
          </div>

          {/* タイトル入力 */}
          <div className="form-group mt-4">
            <label>タイトル</label>
            <input
              type="text"
              value={title}
              placeholder="予定タイトルを入力"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <button className="save-btn" onClick={handleSave}>
            登録する
          </button>
        </div>

        {/* ===== 右：登録済みリスト 3割 ===== */}
        <div className="schedule-section">
          <h2 className="form-title">登録済み日程</h2>
          {savedSchedules.length === 0 ? (
            <p className="text-gray">まだ日程がありません</p>
          ) : (
            <ul>
              {savedSchedules.map((s) => (
                <li key={s.id} className="schedule-card">
                  <span className="schedule-title">{s.title}</span>
                  <div>
                    {s.dates.map((d, i) => (
                      <span key={i} className="date-tag">
                        {month + 1}/{d}
                      </span>
                    ))}
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(s.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
