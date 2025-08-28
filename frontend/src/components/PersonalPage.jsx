// frontend/src/components/PersonalPage.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "react-calendar/dist/Calendar.css";
import "../personal.css";

const hd = new Holidays("JP");

const PersonalPage = () => {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(new Date());
  const [timeType, setTimeType] = useState("allday");
  const [events, setEvents] = useState([]);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  const token = localStorage.getItem("jwt");

  // 予定取得
  useEffect(() => {
    if (!token) return;

    fetch("/api/personal-events", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("取得失敗");
        return res.json();
      })
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("取得失敗:", err);
        setEvents([]);
      });
  }, [token]);

  // 祝日判定
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday && holiday[0]) {
        return <p className="holiday-name">{holiday[0].name}</p>;
      }
    }
    return null;
  };

  // 保存
  const handleRegister = () => {
    if (!title.trim()) return alert("タイトルを入力してください");

    const newEvent = {
      title,
      memo,
      dates: [
        {
          date: date.toISOString().split("T")[0],
          timeType,
          startTime: timeType === "custom" ? startTime : null,
          endTime: timeType === "custom" ? endTime : null,
        },
      ],
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
      .then((res) => {
        if (!res.ok) throw new Error("保存失敗");
        return res.json();
      })
      .then((saved) => {
        setEvents([...events, saved]);
        setTitle("");
        setMemo("");
      })
      .catch((err) => {
        console.error("保存失敗:", err);
        alert("保存に失敗しました");
      });
  };

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

      <div className="calendar-list-container">
        <div className="calendar-container">
          <Calendar
            onChange={setDate}
            value={date}
            locale="ja-JP"
            calendarType="gregory"
            tileContent={tileContent}
          />
        </div>

        <div className="list-container">
          <h2>選択中の日程</h2>
          <p className="selected-date-badge">
            {date.toLocaleDateString("ja-JP")}
          </p>
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
                <strong>{ev.dates?.[0]?.date}</strong>{" "}
                {ev.title} ({ev.dates?.[0]?.timeType})
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
