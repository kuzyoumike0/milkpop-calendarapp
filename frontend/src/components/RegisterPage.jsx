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
  const [selectionMode, setSelectionMode] = useState("single"); // single, range, multi
  const [rangeStart, setRangeStart] = useState(null);

  const hd = new Holidays("JP");
  const todayStr = new Date().toISOString().split("T")[0];

  // 📌 日付クリック処理
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];

    if (selectionMode === "single") {
      setSelectedDates([dateStr]);
    } else if (selectionMode === "multi") {
      setSelectedDates((prev) =>
        prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
      );
    } else if (selectionMode === "range") {
      if (!rangeStart) {
        // 最初のクリック → 開始点だけ選択
        setRangeStart(dateStr);
        setSelectedDates([dateStr]);
      } else {
        // 2回目クリック → 範囲を全選択
        const start = new Date(rangeStart);
        const end = new Date(dateStr);
        if (start > end) [start, end] = [end, start]; // 順序入れ替え

        const range = [];
        const cur = new Date(start);
        while (cur <= end) {
          range.push(cur.toISOString().split("T")[0]);
          cur.setDate(cur.getDate() + 1);
        }

        setSelectedDates(range);
        setRangeStart(null); // 範囲終了でリセット
      }
    }
  };

  // 📌 時間帯選択
  const handleTimeChange = (date, value) => {
    setTimeSelections((prev) => ({ ...prev, [date]: value }));
  };

  // 📌 custom 開始/終了時間
  const handleCustomStartChange = (date, value) => {
    setCustomTimes((prev) => ({
      ...prev,
      [date]: { ...prev[date], start: value },
    }));
  };
  const handleCustomEndChange = (date, value) => {
    setCustomTimes((prev) => ({
      ...prev,
      [date]: { ...prev[date], end: value },
    }));
  };

  // 📌 日付表示フォーマット
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
        <label>
          <input
            type="radio"
            name="mode"
            value="single"
            checked={selectionMode === "single"}
            onChange={() => setSelectionMode("single")}
          />
          単日
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => setSelectionMode("range")}
          />
          範囲
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="multi"
            checked={selectionMode === "multi"}
            onChange={() => setSelectionMode("multi")}
          />
          複数
        </label>
      </div>

      {/* カレンダー＋リスト */}
      <div className="calendar-container">
        <div className="calendar-box">
          <Calendar
            locale="ja-JP"
            onClickDay={handleDateClick}
            tileContent={({ date, view }) => {
              if (view === "month") {
                const holiday = hd.isHoliday(date);
                return (
                  <div className="calendar-tile-content">
                    {holiday ? (
                      <span className="holiday-name">{holiday.name}</span>
                    ) : null}
                  </div>
                );
              }
            }}
            tileClassName={({ date, view }) => {
              if (view !== "month") return "";

              const dateStr = date.toISOString().split("T")[0];
              const day = date.getDay();
              const holiday = hd.isHoliday(date);

              let classes = [];
              if (dateStr === todayStr) classes.push("today");
              if (holiday || day === 0) classes.push("sunday-holiday");
              else if (day === 6) classes.push("saturday");
              if (selectedDates.includes(dateStr)) classes.push("selected-day");
              if (rangeStart === dateStr) classes.push("range-start");

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

                  {/* 時間帯ラジオ */}
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name={`time-${date}`}
                        value="all"
                        checked={timeSelections[date] === "all"}
                        onChange={(e) => handleTimeChange(date, e.target.value)}
                      />
                      終日
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`time-${date}`}
                        value="day"
                        checked={timeSelections[date] === "day"}
                        onChange={(e) => handleTimeChange(date, e.target.value)}
                      />
                      昼
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`time-${date}`}
                        value="night"
                        checked={timeSelections[date] === "night"}
                        onChange={(e) => handleTimeChange(date, e.target.value)}
                      />
                      夜
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`time-${date}`}
                        value="custom"
                        checked={timeSelections[date] === "custom"}
                        onChange={(e) => handleTimeChange(date, e.target.value)}
                      />
                      時間指定
                    </label>
                  </div>

                  {timeSelections[date] === "custom" && (
                    <div className="custom-time">
                      <select
                        className="time-dropdown"
                        onChange={(e) =>
                          handleCustomStartChange(date, e.target.value)
                        }
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}:00
                          </option>
                        ))}
                      </select>
                      <span> ~ </span>
                      <select
                        className="time-dropdown"
                        onChange={(e) =>
                          handleCustomEndChange(date, e.target.value)
                        }
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}:00
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

      {/* 共有リンク */}
      <div className="share-link-container">
        <button className="share-link-btn">✨ 共有リンクを発行</button>
      </div>
    </div>
  );
};

export default RegisterPage;
