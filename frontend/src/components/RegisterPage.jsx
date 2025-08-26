// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import "../register.css";

const hd = new Holidays("JP");

export default function RegisterPage() {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeType, setTimeType] = useState("終日");
  const [shareUrl, setShareUrl] = useState("");
  const [selectMode, setSelectMode] = useState("single");
  const [rangeStart, setRangeStart] = useState(null);

  // === 日付クリック処理 ===
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().slice(0, 10);

    if (selectMode === "single") {
      setSelectedDates([{ date: dateStr, timeType }]);
    } else if (selectMode === "multi") {
      setSelectedDates((prev) => [
        ...prev,
        { date: dateStr, timeType },
      ]);
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

  // === 共有リンク発行 ===
  const handleShare = async () => {
    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        dates: selectedDates,
        options: { timeType },
      }),
    });
    const data = await res.json();
    setShareUrl(`${window.location.origin}/share/${data.share_token}`);
  };

  // === 日付セルの装飾 ===
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday) {
        return <div className="holiday-name">{holiday[0].name}</div>;
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const weekday = date.getDay();
      const holiday = hd.isHoliday(date);
      if (holiday || weekday === 0) return "sunday"; // 日曜・祝日 赤
      if (weekday === 6) return "saturday"; // 土曜 青
      return "weekday"; // 平日 黒
    }
    return null;
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
        {/* カレンダー */}
        <div className="calendar-box">
          <Calendar
            locale="ja-JP"
            onClickDay={handleDateClick}
            tileContent={tileContent}
            tileClassName={tileClassName}
            calendarType="gregory"
          />
        </div>

        {/* 右側パネル */}
        <div className="register-box">
          {/* モード切替 */}
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

          {/* 時間帯選択 */}
          <div className="time-type-buttons">
            {["終日", "昼", "夜", "時間指定"].map((t) => (
              <button
                key={t}
                className={timeType === t ? "active" : ""}
                onClick={() => setTimeType(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* 共有リンク */}
          <button className="share-btn" onClick={handleShare}>
            共有リンク発行
          </button>
          {shareUrl && (
            <div className="share-link">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="share-link-url"
              >
                {shareUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
