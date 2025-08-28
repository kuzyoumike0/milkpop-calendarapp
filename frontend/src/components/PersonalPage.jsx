// frontend/src/components/PersonalPage.jsx
import React, { useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../personal.css";

const hd = new Holidays("JP");

const PersonalPage = () => {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("single"); // single / multi / range
  const [rangeStart, setRangeStart] = useState(null);

  const token = localStorage.getItem("jwt");

  // === DBから取得 ===
  useEffect(() => {
    fetch("/api/personal-events", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch((err) => console.error("取得失敗:", err));
  }, [token]);

  // === カレンダー生成 ===
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);

  const getMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    let current = new Date(firstDay);
    current.setDate(current.getDate() - current.getDay()); // 週頭まで戻す

    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const monthDays = getMonthDays(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  // === 日付クリック処理 ===
  const handleDateClick = (day) => {
    if (!day) return;
    const dateStr = day.toISOString().split("T")[0];

    if (mode === "single") {
      setSelectedDates([
        { date: dateStr, timeType: "allday", startTime: null, endTime: null },
      ]);
    } else if (mode === "multi") {
      const exists = selectedDates.find((d) => d.date === dateStr);
      if (exists) {
        setSelectedDates(selectedDates.filter((d) => d.date !== dateStr));
      } else {
        setSelectedDates([
          ...selectedDates,
          { date: dateStr, timeType: "allday", startTime: null, endTime: null },
        ]);
      }
    } else if (mode === "range") {
      if (!rangeStart) {
        setRangeStart(day);
        setSelectedDates([
          { date: dateStr, timeType: "allday", startTime: null, endTime: null },
        ]);
      } else {
        const rangeEnd = day;
        const start = rangeStart < rangeEnd ? rangeStart : rangeEnd;
        const end = rangeStart < rangeEnd ? rangeEnd : rangeStart;

        const rangeDays = [];
        let current = new Date(start);
        while (current <= end) {
          rangeDays.push({
            date: current.toISOString().split("T")[0],
            timeType: "allday",
            startTime: null,
            endTime: null,
          });
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(rangeDays);
        setRangeStart(null);
      }
    }
  };

  // === 保存処理 ===
  const handleRegister = () => {
    if (!title.trim() || selectedDates.length === 0) {
      return alert("タイトルと日程を入力してください");
    }

    const newEvent = {
      title,
      memo,
      dates: selectedDates,
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

  // === 編集 ===
  const handleEdit = (id) => {
    const ev = events.find((e) => e.id === id);
    if (!ev) return;
    setTitle(ev.title);
    setMemo(ev.memo);
    setSelectedDates(ev.dates || []);
    // 編集対象を削除（保存時に新規で追加）
    setEvents(events.filter((e) => e.id !== id));
    fetch(`/api/personal-events/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  // === 削除 ===
  const handleDelete = (id) => {
    fetch(`/api/personal-events/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setEvents(events.filter((e) => e.id !== id));
      })
      .catch((err) => console.error("削除失敗:", err));
  };

  return (
    <div className="personal-page">
      <h1 className="page-title">個人日程登録ページ</h1>

      {/* 入力フォーム */}
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
            onClick={() => setMode(m)}
          >
            {m === "single" ? "単日" : m === "multi" ? "複数選択" : "範囲選択"}
          </button>
        ))}
      </div>

      {/* レイアウト */}
      <div className="calendar-list-container">
        {/* カレンダー */}
        <div className="calendar-box">
          <div className="calendar-header">
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                    1
                  )
                )
              }
            >
              ◀
            </button>
            <span>
              {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
            </span>
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    1
                  )
                )
              }
            >
              ▶
            </button>
          </div>
          <table className="calendar-table">
            <thead>
              <tr>
                {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
                  <th
                    key={i}
                    className={i === 0 ? "sunday" : i === 6 ? "saturday" : ""}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: monthDays.length / 7 }).map((_, w) => (
                <tr key={w}>
                  {monthDays.slice(w * 7, w * 7 + 7).map((day, i) => {
                    const dateStr = day.toISOString().split("T")[0];
                    const holiday = hd.isHoliday(day);
                    const isSelected = selectedDates.some(
                      (d) => d.date === dateStr
                    );
                    const isOtherMonth =
                      day.getMonth() !== currentMonth.getMonth();
                    return (
                      <td
                        key={i}
                        className={`${isOtherMonth ? "other-month" : ""} ${
                          isSelected ? "selected-date" : ""
                        } ${holiday ? "sunday" : ""}`}
                        onClick={() => handleDateClick(day)}
                      >
                        {day.getDate()}
                        {holiday && (
                          <span className="holiday-name">
                            {holiday[0].name}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 選択中リスト */}
        <div className="list-container">
          <h2>選択中の日程</h2>
          {selectedDates.map((d, i) => (
            <div key={i} className="selected-card">
              <span className="date-badge">{d.date}</span>
              <div className="time-buttons">
                {["allday", "day", "night", "custom"].map((type) => (
                  <button
                    key={type}
                    className={`time-btn ${d.timeType === type ? "active" : ""}`}
                    onClick={() => {
                      const newDates = [...selectedDates];
                      newDates[i].timeType = type;
                      setSelectedDates(newDates);
                    }}
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
              {d.timeType === "custom" && (
                <div className="custom-time">
                  <select
                    value={d.startTime || "09:00"}
                    onChange={(e) => {
                      const newDates = [...selectedDates];
                      newDates[i].startTime = e.target.value;
                      setSelectedDates(newDates);
                    }}
                    className="cute-select"
                  >
                    {Array.from({ length: 24 }).map((_, h) => (
                      <option key={h} value={`${String(h).padStart(2, "0")}:00`}>
                        {`${String(h).padStart(2, "0")}:00`}
                      </option>
                    ))}
                  </select>
                  <span>〜</span>
                  <select
                    value={d.endTime || "18:00"}
                    onChange={(e) => {
                      const newDates = [...selectedDates];
                      newDates[i].endTime = e.target.value;
                      setSelectedDates(newDates);
                    }}
                    className="cute-select"
                  >
                    {Array.from({ length: 24 }).map((_, h) => (
                      <option key={h} value={`${String(h).padStart(2, "0")}:00`}>
                        {`${String(h).padStart(2, "0")}:00`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
          <button className="register-btn" onClick={handleRegister}>
            登録する
          </button>
        </div>
      </div>

      {/* 登録済み */}
      <div className="registered-container">
        <h2>登録済みの予定</h2>
        <ul>
          {events.map((ev) => (
            <li key={ev.id} className="registered-card">
              <strong>{ev.title}</strong> {ev.memo && <p>{ev.memo}</p>}
              <ul>
                {ev.dates.map((d, i) => (
                  <li key={i}>
                    {d.date} ({d.timeType}
                    {d.startTime && d.endTime
                      ? ` ${d.startTime}~${d.endTime}`
                      : ""}
                    )
                  </li>
                ))}
              </ul>
              <button onClick={() => handleEdit(ev.id)}>編集</button>
              <button onClick={() => handleDelete(ev.id)}>削除</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PersonalPage;
