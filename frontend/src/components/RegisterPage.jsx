import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "react-calendar/dist/Calendar.css";
import "../common.css";
import "../register.css";

const hd = new Holidays("JP"); // 日本の祝日

const RegisterPage = () => {
  const [value, setValue] = useState(new Date());
  const [holidays, setHolidays] = useState({});
  const [title, setTitle] = useState("");
  const [timeType, setTimeType] = useState("終日");
  const [startHour, setStartHour] = useState("0");
  const [endHour, setEndHour] = useState("1");
  const [events, setEvents] = useState([]);
  const [shareUrl, setShareUrl] = useState("");

  // ===== 祝日読み込み =====
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const holidayList = hd.getHolidays(currentYear);
    const holidayMap = {};
    holidayList.forEach((h) => {
      holidayMap[new Date(h.date).toDateString()] = h.name;
    });
    setHolidays(holidayMap);
  }, []);

  // ===== カレンダー日付の見た目 =====
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holidayName = holidays[date.toDateString()];
      if (holidayName) {
        return <div className="holiday-name">{holidayName}</div>;
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const isSunday = date.getDay() === 0;
      const isHoliday = holidays[date.toDateString()];
      if (isHoliday || isSunday) return "holiday";
      if (date.getDay() === 6) return "saturday";
    }
    return null;
  };

  // ===== 登録処理 =====
  const handleRegister = () => {
    if (!title) return;

    let timeLabel = timeType;
    if (timeType === "時間指定") {
      timeLabel = `${startHour}:00 - ${endHour}:00`;
    }

    const newEvent = {
      title,
      date: Array.isArray(value) ? value.map((d) => d.toDateString()) : [value.toDateString()],
      time: timeLabel,
    };

    const updated = [...events, newEvent].sort((a, b) =>
      new Date(a.date[0]) - new Date(b.date[0])
    );
    setEvents(updated);
    setTitle("");
  };

  // ===== 共有リンク発行 =====
  const handleShare = () => {
    const token = Math.random().toString(36).substr(2, 8);
    const url = `${window.location.origin}/share/${token}`;
    setShareUrl(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("コピーしました！");
  };

  // ===== 時間選択ドロップダウン生成 =====
  const renderHourOptions = () => {
    return Array.from({ length: 24 }, (_, i) => (
      <option key={i} value={i}>
        {i}:00
      </option>
    ));
  };

  return (
    <div className="register-page">
      <h2>日程登録ページ</h2>
      <div className="register-container">
        {/* ===== カレンダー（左7割） ===== */}
        <div className="calendar-container">
          <Calendar
            onChange={setValue}
            value={value}
            locale="ja-JP"
            calendarType="gregory"
            selectRange={true}
            tileContent={tileContent}
            tileClassName={tileClassName}
          />
        </div>

        {/* ===== 登録フォーム＋リスト（右3割） ===== */}
        <div className="side-panel">
          <input
            type="text"
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
          />

          <div className="time-select">
            <label>
              <input
                type="radio"
                name="time"
                value="終日"
                checked={timeType === "終日"}
                onChange={(e) => setTimeType(e.target.value)}
              />
              終日
            </label>
            <label>
              <input
                type="radio"
                name="time"
                value="昼"
                checked={timeType === "昼"}
                onChange={(e) => setTimeType(e.target.value)}
              />
              昼
            </label>
            <label>
              <input
                type="radio"
                name="time"
                value="夜"
                checked={timeType === "夜"}
                onChange={(e) => setTimeType(e.target.value)}
              />
              夜
            </label>
            <label>
              <input
                type="radio"
                name="time"
                value="時間指定"
                checked={timeType === "時間指定"}
                onChange={(e) => setTimeType(e.target.value)}
              />
              時間指定
            </label>
          </div>

          {timeType === "時間指定" && (
            <div className="time-dropdowns">
              <select value={startHour} onChange={(e) => setStartHour(e.target.value)}>
                {renderHourOptions()}
              </select>
              ～
              <select value={endHour} onChange={(e) => setEndHour(e.target.value)}>
                {renderHourOptions()}
              </select>
            </div>
          )}

          <button onClick={handleRegister} className="register-btn">
            登録する
          </button>

          <h3>登録済み日程</h3>
          <ul className="event-list">
            {events.map((e, idx) => (
              <li key={idx}>
                <strong>{e.title}</strong>
                <br />
                {e.date.join(" ~ ")} ({e.time})
              </li>
            ))}
          </ul>

          <button onClick={handleShare} className="share-btn">
            共有リンクを発行
          </button>
          {shareUrl && (
            <div className="share-link">
              <input type="text" value={shareUrl} readOnly />
              <button onClick={handleCopy} className="copy-btn">コピー</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
