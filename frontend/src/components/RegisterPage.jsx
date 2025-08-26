// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "../common.css";
import "../register.css";

const RegisterPage = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeSelections, setTimeSelections] = useState({});
  const [customTimes, setCustomTimes] = useState({});
  const [title, setTitle] = useState("");
  const [selectionMode, setSelectionMode] = useState("range");
  const [rangeStart, setRangeStart] = useState(null);
  const [shareLink, setShareLink] = useState("");

  const hd = new Holidays("JP");

  const getDateStr = (date) => date.toLocaleDateString("sv-SE");
  const todayStr = getDateStr(new Date());

  const year = new Date().getFullYear();
  const holidays = hd.getHolidays(year).reduce((map, h) => {
    const dateStr = getDateStr(new Date(h.date));
    map[dateStr] = h.name;
    return map;
  }, {});

  const handleDateClick = (date) => {
    const dateStr = getDateStr(date);

    if (selectionMode === "multi") {
      setSelectedDates((prev) =>
        prev.includes(dateStr)
          ? prev.filter((d) => d !== dateStr)
          : [...prev, dateStr]
      );
    } else if (selectionMode === "range") {
      if (!rangeStart) {
        setRangeStart(dateStr);
        setSelectedDates([dateStr]);
      } else {
        let start = new Date(rangeStart);
        let end = new Date(dateStr);
        if (start > end) [start, end] = [end, start];

        const range = [];
        const cur = new Date(start);
        while (cur <= end) {
          range.push(getDateStr(cur));
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(range);
        setRangeStart(null);
      }
    }
  };

  const handleTimeChange = (date, value) => {
    setTimeSelections((prev) => ({ ...prev, [date]: value }));
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      weekday: "short",
    });
  };

  return (
    <div className="register-page">
      <h2 className="page-title">📌 日程登録ページ</h2>

      {/* タイトル入力 */}
      <div className="title-input-container">
        <input
          type="text"
          className="title-input"
          placeholder="イベントのタイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* モード切替 */}
      <div className="mode-switch">
        <button
          className={`mode-btn ${selectionMode === "range" ? "active" : ""}`}
          onClick={() => setSelectionMode("range")}
        >
          📏 範囲選択
        </button>
        <button
          className={`mode-btn ${selectionMode === "multi" ? "active" : ""}`}
          onClick={() => setSelectionMode("multi")}
        >
          ✅ 複数選択
        </button>
      </div>

      {/* カレンダー＋リストを横並び */}
      <div className="calendar-container">
        <div className="calendar-box">
          <Calendar
            locale="ja-JP"
            calendarType="US"   // ✅ 日曜始まり
            onClickDay={handleDateClick}
            tileContent={({ date, view }) => {
              if (view === "month") {
                const dateStr = getDateStr(date);
                const holidayName = holidays[dateStr];
                return holidayName ? (
                  <span className="holiday-name">{holidayName}</span>
                ) : null;
              }
            }}
            tileClassName={({ date, view }) => {
              if (view !== "month") return "";
              const dateStr = getDateStr(date);
              const day = date.getDay();

              let classes = [];
              if (dateStr === todayStr) classes.push("today");
              if (holidays[dateStr] || day === 0) classes.push("sunday-holiday");
              else if (day === 6) classes.push("saturday");
              if (selectedDates.includes(dateStr)) classes.push("selected-day");

              return classes.join(" ");
            }}
          />
        </div>

        <div className="selected-dates">
          <h3>📅 選択した日程</h3>
          <ul>
            {selectedDates
              .sort((a, b) => new Date(a) - new Date(b))
              .map((date) => (
                <li key={date} className="date-item">
                  <span className="date-text">{formatDate(date)}</span>
                  <div className="radio-group-inline">
                    <button
                      className={`time-btn ${timeSelections[date] === "all" ? "active" : ""}`}
                      onClick={() => handleTimeChange(date, "all")}
                    >
                      終日
                    </button>
                    <button
                      className={`time-btn ${timeSelections[date] === "day" ? "active" : ""}`}
                      onClick={() => handleTimeChange(date, "day")}
                    >
                      昼
                    </button>
                    <button
                      className={`time-btn ${timeSelections[date] === "night" ? "active" : ""}`}
                      onClick={() => handleTimeChange(date, "night")}
                    >
                      夜
                    </button>
                    <button
                      className={`time-btn ${timeSelections[date] === "custom" ? "active" : ""}`}
                      onClick={() => handleTimeChange(date, "custom")}
                    >
                      時間指定
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
