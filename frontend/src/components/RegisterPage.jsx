// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import "../register.css";

const hd = new Holidays("JP");

export default function RegisterPage() {
  const [title, setTitle] = useState("");
  const [selectMode, setSelectMode] = useState("single");
  const [rangeStart, setRangeStart] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeType, setTimeType] = useState("終日");
  const [shareLink, setShareLink] = useState("");

  // ===== 日付クリック処理 =====
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().slice(0, 10);

    if (selectMode === "single") {
      setSelectedDates([{ date: dateStr, timeType }]);
    } else if (selectMode === "multi") {
      setSelectedDates((prev) => [...prev, { date: dateStr, timeType }]);
    } else if (selectMode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
      } else {
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;
        let rangeDates = [];
        let current = new Date(start);
        while (current <= end) {
          rangeDates.push({
            date: current.toISOString().slice(0, 10),
            timeType,
          });
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(rangeDates);
        setRangeStart(null);
      }
    }
  };

  // ===== 曜日・祝日・範囲強調 =====
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const weekday = date.getDay();
      const holiday = hd.isHoliday(date);
      const dateStr = date.toISOString().slice(0, 10);
      const todayStr = new Date().toISOString().slice(0, 10);

      if (dateStr === todayStr) return "today-highlight"; // 今日強調
      if (rangeStart && !selectedDates.find((d) => d.date === dateStr)) {
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;
        if (date >= start && date <= end) {
          return "in-range";
        }
      }
      if (selectedDates.find((d) => d.date === dateStr)) {
        return "selected-date";
      }
      if (holiday || weekday === 0) return "sunday";
      if (weekday === 6) return "saturday";
      return "weekday";
    }
    return null;
  };

  // ===== 共有リンク発行 =====
  const handleShare = async () => {
    if (!selectedDates.length) return;

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dates: selectedDates }),
      });
      const data = await res.json();
      if (data.share_token) {
        const url = `${window.location.origin}/share/${data.share_token}`;
        setShareLink(url);
      }
    } catch (err) {
      console.error("共有リンク発行エラー:", err);
    }
  };

  return (
    <div className="register-page">
      <h1 className="page-title">日程登録</h1>

      {/* タイトル入力 */}
      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="register-container">
        {/* カレンダー部分 */}
        <div className="calendar-box">
          <div className="mode-buttons">
            <button
              className={selectMode === "single" ? "active" : ""}
              onClick={() => setSelectMode("single")}
            >
              単日
            </button>
            <button
              className={selectMode === "multi" ? "active" : ""}
              onClick={() => setSelectMode("multi")}
            >
              複数選択
            </button>
            <button
              className={selectMode === "range" ? "active" : ""}
              onClick={() => setSelectMode("range")}
            >
              範囲選択
            </button>
          </div>

          <Calendar
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
            calendarType="US"
            locale="ja-JP"
          />
        </div>

        {/* 選択中日程 */}
        <div className="register-box">
          <h3>選択中の日程</h3>
          <ul className="event-list">
            {selectedDates.map((d, idx) => (
              <li key={idx}>
                {d.date}
                <div className="time-type-buttons">
                  {["終日", "昼", "夜", "時間指定"].map((type) => (
                    <button
                      key={type}
                      className={d.timeType === type ? "active" : ""}
                      onClick={() =>
                        setSelectedDates((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, timeType: type } : item
                          )
                        )
                      }
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {d.timeType === "時間指定" && (
                  <div className="time-dropdowns">
                    <select>
                      {Array.from({ length: 24 }).map((_, h) => (
                        <option key={h} value={h}>
                          {h}:00
                        </option>
                      ))}
                    </select>
                    ～
                    <select>
                      {Array.from({ length: 24 }).map((_, h) => (
                        <option key={h} value={h}>
                          {h}:00
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 共有リンク発行 */}
      <div className="share-section">
        <button className="share-btn" onClick={handleShare}>
          共有リンク発行
        </button>

        {shareLink && (
          <div className="share-link">
            <a href={shareLink} target="_blank" rel="noopener noreferrer">
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
  );
}
