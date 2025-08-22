// frontend/src/components/PersonalPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const PersonalPage = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [time, setTime] = useState("終日");

  // 日付クリック
  const handleDateClick = (date) => {
    const dateStr = date.toDateString();
    if (selectedDates.some((d) => d.toDateString() === dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d.toDateString() !== dateStr));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  // 登録
  const handleAddEvent = () => {
    if (!title) return;
    const newEvent = {
      id: Date.now(),
      title,
      memo,
      time,
      dates: selectedDates.map((d) => d.toDateString()),
    };
    setEvents([...events, newEvent]);
    setTitle("");
    setMemo("");
    setTime("終日");
    setSelectedDates([]);
  };

  return (
    <div className="page-container">
      {/* バナー */}
      <div className="banner">
        <span>MilkPOP Calendar</span>
        <nav className="nav-links">
          <a href="/">🏠 トップ</a>
          <a href="/register">🗓 日程登録</a>
          <a href="/personal">👤 個人スケジュール</a>
        </nav>
      </div>

      {/* レイアウト */}
      <div className="register-layout">
        {/* カレンダー */}
        <div className="calendar-section">
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={({ date }) =>
              selectedDates.some((d) => d.toDateString() === date.toDateString())
                ? "selected-date"
                : ""
            }
          />
        </div>

        {/* 右側リスト */}
        <div className="event-list">
          <h2 className="section-title">スケジュール登録</h2>
          <input
            type="text"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-box"
          />
          <textarea
            placeholder="メモ"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="input-box"
          />
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input-box"
          >
            <option value="終日">終日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
            <option value="時間指定">時間指定</option>
          </select>
          <button onClick={handleAddEvent} className="add-btn">
            ➕ 登録
          </button>

          <h2 className="section-title">登録済みスケジュール</h2>
          <ul>
            {events.map((ev) => (
              <li key={ev.id} className="event-item">
                <strong>{ev.title}</strong> ({ev.time})
                <br />
                {ev.dates.join(", ")}
                {ev.memo && <p className="memo">{ev.memo}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PersonalPage;
