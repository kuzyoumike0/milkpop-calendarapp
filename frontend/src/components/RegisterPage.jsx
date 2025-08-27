import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "react-calendar/dist/Calendar.css";
import "../register.css";

const hd = new Holidays("JP");

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("single");
  const [shareUrl, setShareUrl] = useState("");
  const [timeSettings, setTimeSettings] = useState({});

  const handleDateChange = (date) => {
    if (mode === "single") {
      setSelectedDates([date]);
    } else if (mode === "multiple") {
      setSelectedDates((prev) =>
        prev.some((d) => d.toDateString() === date.toDateString())
          ? prev.filter((d) => d.toDateString() !== date.toDateString())
          : [...prev, date]
      );
    } else if (mode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const end = date;
        const range = [];
        let current = new Date(start);
        while (current <= end) {
          range.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(range);
      } else {
        setSelectedDates([date]);
      }
    }
  };

  const handleShareLink = async () => {
    const token = crypto.randomUUID();
    const url = `${window.location.origin}/share/${token}`;
    setShareUrl(url);

    await fetch("http://localhost:5000/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        title,
        dates: selectedDates.map((d) => {
          const key = d.toISOString().split("T")[0];
          const setting = timeSettings[key] || {};
          return {
            date: key,
            timeType: setting.type || "未定",
            startTime: setting.start || null,
            endTime: setting.end || null,
          };
        }),
      }),
    });
  };

  const handleTimeChange = (dateKey, type) => {
    setTimeSettings((prev) => ({
      ...prev,
      [dateKey]: { type, start: null, end: null },
    }));
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      return (
        <div>
          {holiday && <span className="holiday-name">{holiday[0].name}</span>}
        </div>
      );
    }
    return null;
  };

  const formatDate = (date) => date.toISOString().split("T")[0];

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

      <div className="mode-tabs">
        <button className={mode === "single" ? "active" : ""} onClick={() => setMode("single")}>
          単日
        </button>
        <button className={mode === "multiple" ? "active" : ""} onClick={() => setMode("multiple")}>
          複数選択
        </button>
        <button className={mode === "range" ? "active" : ""} onClick={() => setMode("range")}>
          範囲選択
        </button>
      </div>

      <div className="calendar-container">
        <div className="calendar-box">
          <Calendar
            onClickDay={handleDateChange}
            value={selectedDates}
            tileContent={tileContent}
            tileClassName={({ date }) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const d = new Date(date);
              d.setHours(0, 0, 0, 0);

              if (selectedDates.some((sel) => sel.toDateString() === d.toDateString())) {
                return "selected-date";
              }
              if (d.getTime() === today.getTime()) return "today";
              if (d.getDay() === 0) return "sunday";
              if (d.getDay() === 6) return "saturday";
              return "";
            }}
          />
        </div>

        <div className="selected-list">
          <h3>選択中の日程</h3>
          {selectedDates.map((date, idx) => {
            const key = formatDate(date);
            return (
              <div key={idx} className="selected-card">
                <span className="date-badge">{key}</span>
                <div className="time-buttons">
                  {["終日", "昼", "夜", "時間指定"].map((t) => (
                    <button
                      key={t}
                      className={`time-btn ${
                        timeSettings[key]?.type === t ? "active" : ""
                      }`}
                      onClick={() => handleTimeChange(key, t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button className="save-btn" onClick={handleShareLink}>
        共有リンクを発行
      </button>

      {shareUrl && (
        <div className="share-link-box">
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
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
