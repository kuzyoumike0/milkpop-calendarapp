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

  // 予定取得
  useEffect(() => {
    fetch("/api/personal-events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("取得失敗:", err));
  }, []);

  // 祝日判定
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday) {
        return <p className="holiday-name">{holiday[0].name}</p>;
      }
    }
    return null;
  };

  // イベント登録
  const handleRegister = () => {
    if (!title.trim()) return alert("タイトルを入力してください");

    const newEvent = {
      title,
      memo,
      date: date.toISOString().split("T")[0],
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

      {/* カレンダー */}
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

      {/* 時間区分選択 */}
      <div className="time-options">
        <label>
          <input
            type="radio"
            value="allday"
            checked={timeType === "allday"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          終日
        </label>
        <label>
          <input
            type="radio"
            value="day"
            checked={timeType === "day"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          昼
        </label>
        <label>
          <input
            type="radio"
            value="night"
            checked={timeType === "night"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          夜
        </label>
        <label>
          <input
            type="radio"
            value="custom"
            checked={timeType === "custom"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          時間指定
        </label>
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
  );
};

export default PersonalPage;
