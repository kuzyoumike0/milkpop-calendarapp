import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../common.css";
import "../register.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeType, setTimeType] = useState("終日");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [shareLink, setShareLink] = useState("");

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (selectedDates.find((d) => d.date === dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d.date !== dateStr));
    } else {
      setSelectedDates([...selectedDates, { date: dateStr, timeType }]);
    }
  };

  const handleSave = async () => {
    const datesWithTime = selectedDates.map((d) => ({
      ...d,
      timeType,
      startTime: timeType === "時間指定" ? startTime : null,
      endTime: timeType === "時間指定" ? endTime : null,
    }));

    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        dates: datesWithTime,
        options: {},
      }),
    });
    const data = await res.json();
    if (data.share_token) {
      setShareLink(`${window.location.origin}/share/${data.share_token}`);
    }
  };

  return (
    <div className="register-page">
      <h1 className="page-title">日程登録</h1>

      <div className="register-container">
        <div className="calendar-container glass-card">
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={({ date }) => {
              const dateStr = date.toISOString().split("T")[0];
              return selectedDates.find((d) => d.date === dateStr)
                ? "selected-day"
                : "";
            }}
          />
        </div>

        <div className="side-panel glass-card">
          <input
            type="text"
            placeholder="タイトルを入力"
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="mode-buttons">
            {["終日", "昼", "夜", "時間指定"].map((mode) => (
              <button
                key={mode}
                className={timeType === mode ? "active" : ""}
                onClick={() => setTimeType(mode)}
              >
                {mode}
              </button>
            ))}
          </div>

          {timeType === "時間指定" && (
            <div className="time-dropdowns">
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                <option value="">開始</option>
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={`${i}:00`}>
                    {i}:00
                  </option>
                ))}
              </select>
              <span>〜</span>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              >
                <option value="">終了</option>
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={`${i}:00`}>
                    {i}:00
                  </option>
                ))}
              </select>
            </div>
          )}

          <button className="share-btn" onClick={handleSave}>
            共有リンク発行
          </button>
          {shareLink && (
            <div className="share-link">
              <a
                href={shareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="share-link-url"
              >
                {shareLink}
              </a>
              <button
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(shareLink)}
              >
                コピー
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
