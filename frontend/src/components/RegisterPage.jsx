// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import { useNavigate } from "react-router-dom";
import Holidays from "date-holidays";
import "../register.css";

const hd = new Holidays("JP"); // 日本の祝日
const timeTypes = ["終日", "昼", "夜", "時間指定"];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("single"); // single, multiple, range
  const [dates, setDates] = useState([]);
  const [shareUrl, setShareUrl] = useState("");

  // ==== 日付選択 ====
  const handleDateChange = (date) => {
    if (mode === "single") {
      setDates([{ date: date.toISOString().split("T")[0], timeType: "終日" }]);
    } else if (mode === "multiple") {
      const iso = date.toISOString().split("T")[0];
      if (dates.some((d) => d.date === iso)) {
        setDates(dates.filter((d) => d.date !== iso));
      } else {
        setDates([...dates, { date: iso, timeType: "終日" }]);
      }
    } else if (mode === "range") {
      if (dates.length === 0 || dates.length === 2) {
        setDates([{ date: date.toISOString().split("T")[0], timeType: "終日" }]);
      } else if (dates.length === 1) {
        const start = new Date(dates[0].date);
        const end = date;
        const range = [];
        const cur = new Date(start);
        while (cur <= end) {
          range.push({ date: cur.toISOString().split("T")[0], timeType: "終日" });
          cur.setDate(cur.getDate() + 1);
        }
        setDates(range);
      }
    }
  };

  // ==== 時間帯切替 ====
  const handleTimeTypeChange = (date, type) => {
    setDates((prev) =>
      prev.map((d) =>
        d.date === date
          ? {
              ...d,
              timeType: type,
              startTime: type === "時間指定" ? d.startTime || "09:00" : null,
              endTime: type === "時間指定" ? d.endTime || "10:00" : null,
            }
          : d
      )
    );
  };

  // ==== 時刻変更 ====
  const handleTimeChange = (date, field, value) => {
    setDates((prev) =>
      prev.map((d) => (d.date === date ? { ...d, [field]: value } : d))
    );
  };

  // ==== 共有リンク発行 ====
  const handleShare = () => {
    const newToken = crypto.randomUUID();
    const url = `${window.location.origin}/share/${newToken}`;
    setShareUrl(url);
  };

  // ==== カレンダーの日付タイル ====
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      const isSunday = date.getDay() === 0;
      const isSaturday = date.getDay() === 6;
      const today = new Date();
      const JST = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
      const isToday =
        date.getFullYear() === JST.getFullYear() &&
        date.getMonth() === JST.getMonth() &&
        date.getDate() === JST.getDate();

      return (
        <div
          className={`${
            isSunday ? "sunday" : isSaturday ? "saturday" : ""
          } ${holiday ? "holiday" : ""} ${isToday ? "today" : ""}`}
        >
          <div>{date.getDate()}日</div>
          {holiday && <div className="holiday-name">{holiday[0].name}</div>}
        </div>
      );
    }
    return null;
  };

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

      {/* ==== 選択モード ==== */}
      <div className="mode-tabs">
        <button
          className={mode === "single" ? "active" : ""}
          onClick={() => setMode("single")}
        >
          単日
        </button>
        <button
          className={mode === "multiple" ? "active" : ""}
          onClick={() => setMode("multiple")}
        >
          複数選択
        </button>
        <button
          className={mode === "range" ? "active" : ""}
          onClick={() => setMode("range")}
        >
          範囲選択
        </button>
      </div>

      <div className="calendar-container">
        <div className="calendar-box">
          <Calendar
            onClickDay={handleDateChange}
            value={dates.map((d) => new Date(d.date))}
            tileContent={tileContent}
            locale="ja-JP"
          />
        </div>

        {/* ==== 選択中の日程 ==== */}
        <div className="selected-list">
          <h3>選択中の日程</h3>
          {dates.map((d) => (
            <div key={d.date} className="selected-card">
              <span className="date-badge">{d.date}</span>
              <div className="time-buttons">
                {timeTypes.map((type) => (
                  <button
                    key={type}
                    className={`time-btn ${d.timeType === type ? "active" : ""}`}
                    onClick={() => handleTimeTypeChange(d.date, type)}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* 時間指定のときだけプルダウン */}
              {d.timeType === "時間指定" && (
                <div className="time-select-box">
                  <select
                    className="cute-select"
                    value={d.startTime}
                    onChange={(e) =>
                      handleTimeChange(d.date, "startTime", e.target.value)
                    }
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={`${String(i).padStart(2, "0")}:00`}>
                        {String(i).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                  ～
                  <select
                    className="cute-select"
                    value={d.endTime}
                    onChange={(e) =>
                      handleTimeChange(d.date, "endTime", e.target.value)
                    }
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={`${String(i).padStart(2, "0")}:00`}>
                        {String(i).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ==== 共有リンク発行 ==== */}
      <div className="share-link-box">
        <button className="save-btn" onClick={handleShare}>
          共有リンクを発行
        </button>
        {shareUrl && (
          <>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer">
              {shareUrl}
            </a>
            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert("リンクをコピーしました！");
              }}
            >
              コピー
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
