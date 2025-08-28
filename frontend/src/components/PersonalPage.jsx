// frontend/src/components/PersonalPage.jsx
import React, { useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../personal.css";

const hd = new Holidays("JP");

const PersonalPage = () => {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date()); // 表示中の年月
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("single"); // single | multi | range
  const [timeType, setTimeType] = useState("allday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [rangeStart, setRangeStart] = useState(null);
  const [events, setEvents] = useState([]);

  const token = localStorage.getItem("jwt");

  // ===== カレンダー生成 =====
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startDay = firstDay.getDay(); // 曜日
    const totalDays = lastDay.getDate();

    // 前の月の余白
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    // 今月の日
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  // ===== 日付クリック =====
  const handleDateClick = (day) => {
    if (!day) return;

    if (mode === "single") {
      setSelectedDates([day]);
    } else if (mode === "multi") {
      const exists = selectedDates.find(
        (d) => d.toDateString() === day.toDateString()
      );
      if (exists) {
        setSelectedDates(selectedDates.filter((d) => d.toDateString() !== day.toDateString()));
      } else {
        setSelectedDates([...selectedDates, day]);
      }
    } else if (mode === "range") {
      if (!rangeStart) {
        setRangeStart(day);
        setSelectedDates([day]);
      } else {
        const rangeEnd = day;
        const start = rangeStart < rangeEnd ? rangeStart : rangeEnd;
        const end = rangeStart < rangeEnd ? rangeEnd : rangeStart;

        const rangeDays = [];
        let current = new Date(start);
        while (current <= end) {
          rangeDays.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(rangeDays);
        setRangeStart(null);
      }
    }
  };

  // ===== 保存 =====
  const handleRegister = () => {
    if (!title.trim() || selectedDates.length === 0) {
      return alert("タイトルと日程を入力してください");
    }

    const newEvent = {
      title,
      memo,
      dates: selectedDates.map((d) => ({
        date: d.toISOString().split("T")[0],
        timeType,
        startTime: timeType === "custom" ? startTime : null,
        endTime: timeType === "custom" ? endTime : null,
      })),
    };

    fetch("/api/personal-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(newEvent),
    })
      .then((res) => res.json())
      .then((saved) => {
        setEvents([...events, saved]);
        setTitle("");
        setMemo("");
        setSelectedDates([]);
      })
      .catch((err) => console.error("保存失敗:", err));
  };

  // ====== レンダリング ======
  const days = getCalendarDays();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  return (
    <div className="personal-page">
      <h1 className="page-title">個人日程登録ページ</h1>

      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力してください"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="memo-input"
        placeholder="メモを入力してください"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      {/* モード切替 */}
      <div className="mode-tabs">
        {["single", "multi", "range"].map((m) => (
          <button
            key={m}
            className={mode === m ? "active" : ""}
            onClick={() => {
              setMode(m);
              setSelectedDates([]);
              setRangeStart(null);
            }}
          >
            {m === "single" ? "単日" : m === "multi" ? "複数選択" : "範囲選択"}
          </button>
        ))}
      </div>

      <div className="calendar-list-container">
        {/* ===== カレンダー ===== */}
        <div className="calendar-box">
          <div className="calendar-header">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>◀</button>
            <span>
              {year}年 {month + 1}月
            </span>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>▶</button>
          </div>

          <table className="calendar-table">
            <thead>
              <tr>
                {["日", "月", "火", "水", "木", "金", "土"].map((w, i) => (
                  <th key={i}>{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(Math.ceil(days.length / 7))].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {days.slice(rowIndex * 7, rowIndex * 7 + 7).map((day, i) => {
                    if (!day) return <td key={i}></td>;

                    const isSelected = selectedDates.some(
                      (d) => d.toDateString() === day.toDateString()
                    );
                    const holiday = hd.isHoliday(day);

                    return (
                      <td
                        key={i}
                        className={`${isSelected ? "selected-date" : ""} ${
                          day.getDay() === 0 ? "sunday" : day.getDay() === 6 ? "saturday" : ""
                        }`}
                        onClick={() => handleDateClick(day)}
                      >
                        {day.getDate()}
                        {holiday && <div className="holiday-name">{holiday[0].name}</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== 選択中の日程 ===== */}
        <div className="list-container">
          <h2>選択中の日程</h2>
          {selectedDates.map((d, i) => (
            <div key={i} className="selected-card">
              <span className="date-badge">{d.toLocaleDateString("ja-JP")}</span>
            </div>
          ))}

          {/* 時間区分 */}
          <div className="time-buttons">
            {["allday", "day", "night", "custom"].map((type) => (
              <button
                key={type}
                className={`time-btn ${timeType === type ? "active" : ""}`}
                onClick={() => setTimeType(type)}
              >
                {type === "allday"
                  ? "終日"
                  : type === "day"
                  ? "午前"
                  : type === "night"
                  ? "午後"
                  : "時間指定"}
              </button>
            ))}
          </div>

          {timeType === "custom" && (
            <div className="custom-time">
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="cute-select"
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = String(i).padStart(2, "0");
                  return (
                    <option key={i} value={`${h}:00`}>
                      {`${h}:00`}
                    </option>
                  );
                })}
              </select>
              <span>〜</span>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="cute-select"
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = String(i).padStart(2, "0");
                  return (
                    <option key={i} value={`${h}:00`}>
                      {`${h}:00`}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <button className="register-btn" onClick={handleRegister}>
            登録する
          </button>

          <h2>登録済みの予定</h2>
          <ul>
            {events.map((ev, i) => (
              <li key={i}>
                <strong>{ev.title}</strong>{" "}
                {ev.dates.map((d, j) => (
                  <span key={j}>{d.date}({d.timeType}) </span>
                ))}
                {ev.memo && <p className="memo-text">📝 {ev.memo}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PersonalPage;
