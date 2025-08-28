import React, { useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../personal.css";

const hd = new Holidays("JP");

// 日本時間の今日
const getTodayJST = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
};

// 月の日付を生成
const generateCalendar = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks = [];
  let current = new Date(firstDay);
  current.setDate(current.getDate() - current.getDay());

  while (current <= lastDay || current.getDay() !== 0) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
};

const PersonalPage = () => {
  const today = getTodayJST();
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [timeType, setTimeType] = useState("allday");
  const [events, setEvents] = useState([]);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [weeks, setWeeks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => {
    setWeeks(generateCalendar(currentYear, currentMonth));
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetch("/api/personal-events")
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]));
  }, []);

  const isSameDate = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const holiday = (date) => {
    const h = hd.isHoliday(date);
    return h ? h[0].name : null;
  };

  // 登録
  const handleRegister = () => {
    if (!title.trim()) return alert("タイトルを入力してください");

    const newEvent = {
      title,
      memo,
      date: selectedDate.toISOString().split("T")[0],
      timeType,
      startTime: timeType === "custom" ? startTime : null,
      endTime: timeType === "custom" ? endTime : null,
    };

    fetch("/api/personal-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    })
      .then((res) => res.json())
      .then((saved) => {
        setEvents([...events, saved]);
        setTitle("");
        setMemo("");
      })
      .catch((err) => console.error("保存失敗:", err));
  };

  return (
    <div className="personal-page">
      <h1 className="page-title">個人日程登録ページ</h1>

      {/* タイトル入力 */}
      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力してください"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* メモ入力 */}
      <textarea
        className="memo-input"
        placeholder="メモを入力してください"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      {/* カレンダー + 選択中日程 */}
      <div className="calendar-list-container">
        {/* カレンダー */}
        <div className="calendar-box">
          <div className="calendar-header">
            <button onClick={() => setCurrentMonth(currentMonth - 1)}>◀</button>
            <span>
              {currentYear}年 {currentMonth + 1}月
            </span>
            <button onClick={() => setCurrentMonth(currentMonth + 1)}>▶</button>
          </div>

          <div className="calendar-grid">
            <div className="weekday-header sunday">日</div>
            <div className="weekday-header">月</div>
            <div className="weekday-header">火</div>
            <div className="weekday-header">水</div>
            <div className="weekday-header">木</div>
            <div className="weekday-header">金</div>
            <div className="weekday-header saturday">土</div>

            {weeks.map((week, wi) =>
              week.map((date, di) => {
                const isToday = isSameDate(date, today);
                const isSelected = isSameDate(date, selectedDate);
                const hol = holiday(date);
                return (
                  <div
                    key={`${wi}-${di}`}
                    className={`calendar-cell 
                      ${isToday ? "today" : ""} 
                      ${isSelected ? "selected" : ""}
                      ${date.getDay() === 0 ? "sunday" : ""} 
                      ${date.getDay() === 6 ? "saturday" : ""} 
                      ${date.getMonth() !== currentMonth ? "other-month" : ""}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="date-number">{date.getDate()}</span>
                    {hol && <span className="holiday-label">{hol}</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 選択中日程 */}
        <div className="selected-box">
          <h2>選択中の日程</h2>
          <p className="date-badge">
            {selectedDate.getFullYear()}年
            {String(selectedDate.getMonth() + 1).padStart(2, "0")}月
            {String(selectedDate.getDate()).padStart(2, "0")}日
          </p>
          <div className="time-buttons">
            {["allday", "day", "night"].map((type, idx) => (
              <button
                key={idx}
                className={`time-btn ${timeType === type ? "active" : ""}`}
                onClick={() => setTimeType(type)}
              >
                {type === "allday" ? "終日" : type === "day" ? "午前" : "午後"}
              </button>
            ))}
            <button
              className={`time-btn ${timeType === "custom" ? "active" : ""}`}
              onClick={() => setTimeType("custom")}
            >
              時間指定
            </button>
          </div>

          {timeType === "custom" && (
            <div className="custom-time">
              <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = String(i).padStart(2, "0");
                  return <option key={i}>{`${h}:00`}</option>;
                })}
              </select>
              <span>〜</span>
              <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = String(i).padStart(2, "0");
                  return <option key={i}>{`${h}:00`}</option>;
                })}
              </select>
            </div>
          )}

          <button className="register-btn" onClick={handleRegister}>
            登録する
          </button>
        </div>
      </div>

      {/* 登録済み予定リスト */}
      <div className="list-container full">
        <h2>登録済みの予定</h2>
        <ul>
          {events.map((ev, i) => (
            <li key={i}>
              <strong>{ev.date}</strong> {ev.title} ({ev.timeType})
              {ev.memo && <p className="memo-text">📝 {ev.memo}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PersonalPage;
