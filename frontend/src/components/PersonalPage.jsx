import React, { useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../personal.css";

const hd = new Holidays("JP");

const getTodayJST = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
};

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
  const [selectedDates, setSelectedDates] = useState([today]);

  const [mode, setMode] = useState("single"); // single / multiple / range

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

  // 日付クリック
  const handleSelect = (date) => {
    if (mode === "single") {
      setSelectedDates([date]);
    } else if (mode === "multiple") {
      const exists = selectedDates.some((d) => isSameDate(d, date));
      if (exists) {
        setSelectedDates(selectedDates.filter((d) => !isSameDate(d, date)));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else if (mode === "range") {
      if (selectedDates.length === 0 || selectedDates.length > 1) {
        setSelectedDates([date]);
      } else {
        const start = selectedDates[0];
        const range = [];
        const min = start < date ? start : date;
        const max = start > date ? start : date;
        let cur = new Date(min);
        while (cur <= max) {
          range.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(range);
      }
    }
  };

  // 登録
  const handleRegister = () => {
    if (!title.trim()) return alert("タイトルを入力してください");

    const newEvents = selectedDates.map((d) => ({
      title,
      memo,
      date: d.toISOString().split("T")[0],
      timeType,
      startTime: timeType === "custom" ? startTime : null,
      endTime: timeType === "custom" ? endTime : null,
    }));

    fetch("/api/personal-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvents),
    })
      .then((res) => res.json())
      .then((saved) => {
        setEvents([...events, ...(Array.isArray(saved) ? saved : [saved])]);
        setTitle("");
        setMemo("");
      })
      .catch((err) => console.error("保存失敗:", err));
  };

  return (
    <div className="personal-page">
      <h1 className="page-title">個人日程登録ページ</h1>

      {/* タイトル */}
      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力してください"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* メモ */}
      <textarea
        className="memo-input"
        placeholder="メモを入力してください"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      {/* モード切替 */}
      <div className="mode-tabs">
        <button
          className={mode === "single" ? "active" : ""}
          onClick={() => setMode("single")}
        >
          単日
        </button>
        <button
          className={mode === "multiple" ? "active" : ""}
          onClick={() => setMode("multiple")}
        >
          複数選択
        </button>
        <button
          className={mode === "range" ? "active" : ""}
          onClick={() => setMode("range")}
        >
          範囲選択
        </button>
      </div>

      {/* カレンダー + 選択中日程 */}
      <div className="calendar-list-container">
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
                const isSelected = selectedDates.some((d) => isSameDate(d, date));
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
                    onClick={() => handleSelect(date)}
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
          {selectedDates.map((d, idx) => (
            <p key={idx} className="date-badge">
              {d.getFullYear()}年
              {String(d.getMonth() + 1).padStart(2, "0")}月
              {String(d.getDate()).padStart(2, "0")}日
            </p>
          ))}
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
