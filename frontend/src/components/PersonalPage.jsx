import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "react-calendar/dist/Calendar.css";
import "../common.css";
import "../personal.css";
import CustomDropdown from "./CustomDropdown";

const hd = new Holidays("JP");

const PersonalPage = () => {
  const [value, setValue] = useState(new Date());
  const [holidays, setHolidays] = useState({});
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("single");
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  // ===== 祝日読み込み =====
  useEffect(() => {
    const year = new Date().getFullYear();
    const holidayList = hd.getHolidays(year);
    const holidayMap = {};
    holidayList.forEach((h) => {
      holidayMap[new Date(h.date).toDateString()] = h.name;
    });
    setHolidays(holidayMap);
  }, []);

  // ===== カレンダー装飾 =====
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holidayName = holidays[date.toDateString()];
      if (holidayName) return <div className="holiday-name">{holidayName}</div>;
    }
    return null;
  };
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const isSunday = date.getDay() === 0;
      const isHoliday = holidays[date.toDateString()];
      if (isHoliday || isSunday) return "holiday";
      if (date.getDay() === 6) return "saturday";
    }
    return null;
  };

  // ===== 日付選択 =====
  const handleDateChange = (val) => {
    const newDate = new Date(val).toDateString();
    if (mode === "range" && Array.isArray(val)) {
      const rangeDates = [];
      let start = new Date(val[0]);
      const end = new Date(val[1]);
      while (start <= end) {
        rangeDates.push(new Date(start).toDateString());
        start.setDate(start.getDate() + 1);
      }
      setSelectedDates([...new Set([...selectedDates, ...rangeDates])]);
    } else if (mode === "multi") {
      if (!selectedDates.find((d) => (d.date || d) === newDate)) {
        setSelectedDates([...selectedDates, newDate]);
      }
    } else if (mode === "delete") {
      setSelectedDates((prev) => prev.filter((d) => (d.date || d) !== newDate));
    } else {
      setSelectedDates([newDate]);
    }
  };

  // ===== 日付フォーマット（和暦＋曜日） =====
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString("ja-JP", { weekday: "short" });
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) + `(${weekday})`;
  };

  // ===== 時間帯設定変更 =====
  const handleTimeChange = (date, type, start, end) => {
    setSelectedDates((prev) =>
      prev.map((d) => {
        if ((d.date || d) === date) {
          let newStart = start !== undefined ? Number(start) : d.startHour || 0;
          let newEnd = end !== undefined ? Number(end) : d.endHour || 1;

          if (newStart >= newEnd) {
            if (start !== undefined) {
              newEnd = newStart + 1 <= 24 ? newStart + 1 : 24;
            } else if (end !== undefined) {
              newStart = newEnd - 1 >= 0 ? newEnd - 1 : 0;
            }
          }

          return { date, type, startHour: newStart, endHour: newEnd };
        }
        return d;
      })
    );
  };

  // ===== 単日削除 =====
  const handleDelete = (date) => {
    setSelectedDates((prev) => prev.filter((d) => (d.date || d) !== date));
  };

  // ===== 日程オブジェクト化 & ソート =====
  const enrichedDates = selectedDates
    .map((d) => (typeof d === "string" ? { date: d, type: "終日" } : d))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="personal-page">
      <h2>個人日程登録ページ</h2>
      <div className="personal-container">
        {/* カレンダー */}
        <div className="calendar-container glass-card">
          <div className="mode-buttons">
            <button className={mode === "single" ? "active" : ""} onClick={() => setMode("single")}>
              単日
            </button>
            <button className={mode === "range" ? "active" : ""} onClick={() => setMode("range")}>
              範囲選択
            </button>
            <button className={mode === "multi" ? "active" : ""} onClick={() => setMode("multi")}>
              複数選択
            </button>
            <button className={mode === "delete" ? "active" : ""} onClick={() => setMode("delete")}>
              単日削除
            </button>
          </div>
          <Calendar
            onChange={handleDateChange}
            value={value}
            locale="ja-JP"
            calendarType="gregory"
            selectRange={mode === "range"}
            tileContent={tileContent}
            tileClassName={tileClassName}
          />
        </div>

        {/* 入力フォーム */}
        <div className="side-panel glass-card">
          <h3>予定入力</h3>
          <input
            type="text"
            className="title-input"
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="memo-input"
            placeholder="メモを入力"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          ></textarea>

          <h3>選択中の日程</h3>
          <ul className="event-list">
            {enrichedDates.map((e, idx) => (
              <li key={idx}>
                <div className="event-header">
                  <strong>{formatDate(e.date)}</strong>
                </div>
                <div className="time-type-buttons">
                  {["終日", "午前", "午後", "時間指定"].map((t) => (
                    <button
                      key={t}
                      className={e.type === t ? "active" : ""}
                      onClick={() => handleTimeChange(e.date, t, e.startHour, e.endHour)}
                    >
                      {t}
                    </button>
                  ))}
                  {e.type === "時間指定" && (
                    <div className="time-dropdowns">
                      <CustomDropdown
                        value={e.startHour || 0}
                        max={23}
                        onChange={(val) => handleTimeChange(e.date, "時間指定", val, e.endHour || 1)}
                      />
                      ～
                      <CustomDropdown
                        value={e.endHour || 1}
                        max={24}
                        onChange={(val) => handleTimeChange(e.date, "時間指定", e.startHour || 0, val)}
                      />
                    </div>
                  )}
                  <button className="delete-day-btn" onClick={() => handleDelete(e.date)}>
                    単日削除
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

export default PersonalPage;
