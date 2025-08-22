import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const hd = new Holidays("JP");

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectionMode, setSelectionMode] = useState("range");
  const [rangeStart, setRangeStart] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeType, setTimeType] = useState("allday");
  const [customTime, setCustomTime] = useState({ start: "09:00", end: "18:00" });
  const [events, setEvents] = useState([]);
  const [shareLink, setShareLink] = useState("");

  const handleDateClick = (date) => {
    if (selectionMode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
        setSelectedDates([date]);
      } else {
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;
        const days = [];
        let d = new Date(start);
        while (d <= end) {
          days.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }
        setSelectedDates(days);
        setRangeStart(null);
      }
    } else {
      const exists = selectedDates.some(
        (d) => d.toDateString() === date.toDateString()
      );
      if (exists) {
        setSelectedDates(selectedDates.filter((d) => d.toDateString() !== date.toDateString()));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    }
  };

  const handleRegister = () => {
    if (!title || selectedDates.length === 0) return;

    const newEvent = {
      title,
      dates: selectedDates,
      timeType,
      customTime,
    };

    setEvents([...events, newEvent]);
    setTitle("");
    setSelectedDates([]);
    setShareLink(window.location.origin + "/share/" + Math.random().toString(36).substr(2, 8));
  };

  const tileClassName = ({ date }) => {
    if (hd.isHoliday(date)) {
      return "holiday-tile";
    }
    if (selectedDates.some((d) => d.toDateString() === date.toDateString())) {
      return "selected-tile";
    }
    return null;
  };

  return (
    <div className="page-container">
      <h2 className="page-title">📅 日程登録ページ</h2>

      <div className="card">
        <label className="label">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          placeholder="例: 打ち合わせ"
        />

        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="range"
              checked={selectionMode === "range"}
              onChange={() => setSelectionMode("range")}
            />
            範囲選択
          </label>
          <label>
            <input
              type="radio"
              value="multiple"
              checked={selectionMode === "multiple"}
              onChange={() => setSelectionMode("multiple")}
            />
            複数選択
          </label>
        </div>

        {/* 🎨 カレンダーを中央配置 */}
        <div className="calendar-wrapper">
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
          />
        </div>

        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="allday"
              checked={timeType === "allday"}
              onChange={() => setTimeType("allday")}
            />
            終日
          </label>
          <label>
            <input
              type="radio"
              value="noon"
              checked={timeType === "noon"}
              onChange={() => setTimeType("noon")}
            />
            昼
          </label>
          <label>
            <input
              type="radio"
              value="night"
              checked={timeType === "night"}
              onChange={() => setTimeType("night")}
            />
            夜
          </label>
          <label>
            <input
              type="radio"
              value="custom"
              checked={timeType === "custom"}
              onChange={() => setTimeType("custom")}
            />
            時間指定
          </label>
        </div>

        {timeType === "custom" && (
          <div className="time-inputs">
            <input
              type="time"
              value={customTime.start}
              onChange={(e) => setCustomTime({ ...customTime, start: e.target.value })}
            />
            <span>〜</span>
            <input
              type="time"
              value={customTime.end}
              onChange={(e) => setCustomTime({ ...customTime, end: e.target.value })}
            />
          </div>
        )}

        <button className="btn" onClick={handleRegister}>
          登録する
        </button>
      </div>

      {shareLink && (
        <div className="card">
          <p>🔗 共有リンク: <a href={shareLink}>{shareLink}</a></p>
        </div>
      )}

      <div className="card">
        <h3>登録済み日程</h3>
        {events.length === 0 ? (
          <p>まだ登録されていません</p>
        ) : (
          <ul>
            {events.map((ev, idx) => (
              <li key={idx}>
                <strong>{ev.title}</strong> <br />
                {ev.dates.map((d) => d.toLocaleDateString()).join(", ")} <br />
                {ev.timeType === "custom"
                  ? `${ev.customTime.start}〜${ev.customTime.end}`
                  : ev.timeType}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
