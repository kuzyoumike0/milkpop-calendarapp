import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import "../register.css";

const hd = new Holidays("JP"); // 日本の祝日
const todayJST = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
);

const RegisterPage = () => {
  const [mode, setMode] = useState("single");
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [shareLink, setShareLink] = useState("");

  // 日付クリック
  const handleDateClick = (date) => {
    if (mode === "single") {
      setSelectedDates([{ date, timeType: "終日" }]);
    } else if (mode === "multiple") {
      setSelectedDates((prev) => {
        const exists = prev.find((d) => d.date.toDateString() === date.toDateString());
        return exists
          ? prev.filter((d) => d.date.toDateString() !== date.toDateString())
          : [...prev, { date, timeType: "終日" }];
      });
    } else if (mode === "range") {
      if (selectedDates.length === 0 || selectedDates.length >= 2) {
        setSelectedDates([{ date, timeType: "終日" }]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0].date;
        const range = eachDayOfInterval({ start, end: date }).map((d) => ({
          date: d,
          timeType: "終日",
        }));
        setSelectedDates(range);
      }
    }
  };

  // 範囲ユーティリティ
  const eachDayOfInterval = ({ start, end }) => {
    const arr = [];
    let d = new Date(start);
    while (d <= end) {
      arr.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return arr;
  };

  // 選択判定
  const isSelected = (date) =>
    selectedDates.some((d) => d.date.toDateString() === date.toDateString());

  // tileContent
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      const isSunday = date.getDay() === 0;
      const isSaturday = date.getDay() === 6;
      const isToday =
        date.getFullYear() === todayJST.getFullYear() &&
        date.getMonth() === todayJST.getMonth() &&
        date.getDate() === todayJST.getDate();

      return (
        <div
          className={`
            ${isSunday ? "sunday" : ""}
            ${isSaturday ? "saturday" : ""}
            ${holiday ? "holiday" : ""}
            ${isToday ? "today" : ""}
            ${isSelected(date) ? "selected-date" : ""}
          `}
          style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {holiday && <span className="holiday-name">{holiday[0].name}</span>}
        </div>
      );
    }
    return null;
  };

  // 時間帯変更
  const handleTimeTypeChange = (idx, type) => {
    setSelectedDates((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, timeType: type } : d))
    );
  };

  // 時間選択変更
  const handleTimeChange = (idx, field, value) => {
    setSelectedDates((prev) =>
      prev.map((d, i) =>
        i === idx ? { ...d, [field]: value, timeType: "時間指定" } : d
      )
    );
  };

  // 共有リンク生成
  const handleGenerateLink = () => {
    if (!title.trim() || selectedDates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }
    const token = Math.random().toString(36).substr(2, 8);
    const url = `${window.location.origin}/share/${token}`;
    setShareLink(url);
  };

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert("リンクをコピーしました！");
    }
  };

  // 時刻のリスト（00:00〜23:00）
  const hours = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, "0")}:00`
  );

  return (
    <div className="register-page">
      <h1 className="page-title">日程登録</h1>
      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* モード切替 */}
      <div className="mode-tabs">
        <button
          onClick={() => setMode("single")}
          className={mode === "single" ? "active" : ""}
        >
          単日
        </button>
        <button
          onClick={() => setMode("multiple")}
          className={mode === "multiple" ? "active" : ""}
        >
          複数選択
        </button>
        <button
          onClick={() => setMode("range")}
          className={mode === "range" ? "active" : ""}
        >
          範囲選択
        </button>
      </div>

      {/* カレンダー */}
      <div className="calendar-container">
        <div className="calendar-box">
          <Calendar
            locale="ja-JP"
            calendarType="gregory"
            onClickDay={handleDateClick}
            tileContent={tileContent}
          />
        </div>

        {/* 選択中リスト */}
        <div className="selected-list">
          <h3>選択中の日程</h3>
          {selectedDates.map((item, idx) => (
            <div key={idx} className="selected-card">
              <span className="date-badge">
                {item.date.toISOString().split("T")[0]}
              </span>
              <div className="time-buttons">
                {["終日", "午前", "午後", "時間指定"].map((t) => (
                  <button
                    key={t}
                    className={`time-btn ${item.timeType === t ? "active" : ""}`}
                    onClick={() => handleTimeTypeChange(idx, t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {item.timeType === "時間指定" && (
                <div className="time-select-box">
                  <select
                    className="cute-select"
                    value={item.startTime || ""}
                    onChange={(e) =>
                      handleTimeChange(idx, "startTime", e.target.value)
                    }
                  >
                    <option value="">開始時間</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <span> ~ </span>
                  <select
                    className="cute-select"
                    value={item.endTime || ""}
                    onChange={(e) =>
                      handleTimeChange(idx, "endTime", e.target.value)
                    }
                  >
                    <option value="">終了時間</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 共有リンク */}
      <button className="save-btn" onClick={handleGenerateLink}>
        共有リンクを発行
      </button>
      {shareLink && (
        <div className="share-link-box">
          <a href={shareLink} target="_blank" rel="noopener noreferrer">
            {shareLink}
          </a>
          <button className="copy-btn" onClick={handleCopy}>
            コピー
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
