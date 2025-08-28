import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../personal.css";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [events, setEvents] = useState([]);
  const [timeType, setTimeType] = useState("allday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  // 日本時間で今日
  const today = new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });

  // 日付クリック処理（複数選択対応）
  const handleDateClick = (date) => {
    const dateStr = date.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  // 登録処理
  const handleRegister = () => {
    if (!title || selectedDates.length === 0) return;
    const newEvent = {
      id: Date.now(),
      title,
      memo,
      dates: [...selectedDates],
      timeType,
      startTime,
      endTime,
    };
    setEvents([...events, newEvent]);
    setTitle("");
    setMemo("");
    setSelectedDates([]);
    setTimeType("allday");
  };

  // 曜日カラー設定
  const tileClassName = ({ date }) => {
    const dateStr = date.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
    let classes = ["cell"];

    if (date.getDay() === 0) classes.push("sunday");
    if (date.getDay() === 6) classes.push("saturday");
    if (dateStr === today) classes.push("today");
    if (selectedDates.includes(dateStr)) classes.push("selected");

    return classes.join(" ");
  };

  return (
    <div className="personal-page">
      <h1 className="page-title">個人日程登録</h1>

      {/* 入力欄 */}
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
        {/* カレンダー */}
        <div className="calendar-container">
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
            calendarType="US" // 日曜始まり
          />
        </div>

        {/* 右側パネル */}
        <div className="side-panel">
          {/* 選択中の日程 */}
          <div className="selected-dates">
            <h2>選択中の日程</h2>
            {selectedDates.length > 0 ? (
              selectedDates.map((d, i) => (
                <span key={i} className="selected-date-item">
                  {d}
                </span>
              ))
            ) : (
              <p>未選択</p>
            )}
          </div>

          {/* 時間帯指定 */}
          <div className="custom-time">
            <h2>時間帯</h2>
            <select value={timeType} onChange={(e) => setTimeType(e.target.value)}>
              <option value="allday">終日</option>
              <option value="day">昼</option>
              <option value="night">夜</option>
              <option value="custom">時間指定</option>
            </select>

            {timeType === "custom" && (
              <div style={{ marginTop: "10px" }}>
                <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = String(i).padStart(2, "0");
                    return (
                      <option key={i} value={`${hour}:00`}>
                        {hour}:00
                      </option>
                    );
                  })}
                </select>
                <span> ~ </span>
                <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = String(i).padStart(2, "0");
                    return (
                      <option key={i} value={`${hour}:00`}>
                        {hour}:00
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* 登録ボタン */}
          <button className="register-btn" onClick={handleRegister}>
            登録
          </button>

          {/* 登録済み予定 */}
          <div className="events-list">
            <h2>登録済み予定</h2>
            {events.length > 0 ? (
              events.map((ev) => (
                <div key={ev.id}>
                  <p>
                    <strong>{ev.title}</strong> ({ev.dates.join(", ")})
                  </p>
                  <p>{ev.memo}</p>
                  <p>
                    {ev.timeType === "custom"
                      ? `${ev.startTime} ~ ${ev.endTime}`
                      : ev.timeType}
                  </p>
                </div>
              ))
            ) : (
              <p>まだ予定はありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
