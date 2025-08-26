import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "react-calendar/dist/Calendar.css";
import "../common.css";
import "../register.css";

const hd = new Holidays("JP");

const RegisterPage = () => {
  const [value, setValue] = useState(new Date());
  const [holidays, setHolidays] = useState({});
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("single"); // "range" or "multi"
  const [shareUrl, setShareUrl] = useState("");

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

  // ===== カレンダー日付見た目 =====
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holidayName = holidays[date.toDateString()];
      if (holidayName) {
        return <div className="holiday-name">{holidayName}</div>;
      }
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

  // ===== 日付選択処理 =====
  const handleDateChange = (val) => {
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
      const newDate = new Date(val).toDateString();
      if (!selectedDates.includes(newDate)) {
        setSelectedDates([...selectedDates, newDate]);
      }
    } else {
      // single
      setSelectedDates([new Date(val).toDateString()]);
    }
  };

  // ===== 時間帯設定変更 =====
  const handleTimeChange = (date, type, start, end) => {
    setSelectedDates((prev) =>
      prev.map((d) =>
        d.date === date
          ? { ...d, type, startHour: start, endHour: end }
          : d
      )
    );
  };

  // 日程オブジェクト化
  const enrichedDates = selectedDates.map((d) => {
    if (typeof d === "string") {
      return { date: d, type: "終日" };
    }
    return d;
  });

  // ===== 時間オプション =====
  const renderHourOptions = () => {
    return Array.from({ length: 24 }, (_, i) => (
      <option key={i} value={i}>
        {i}:00
      </option>
    ));
  };

  // ===== 共有リンク発行 =====
  const handleShare = () => {
    const token = Math.random().toString(36).substr(2, 8);
    const url = `${window.location.origin}/share/${token}`;
    setShareUrl(url);
  };

  return (
    <div className="register-page">
      <h2>日程登録ページ</h2>
      <div className="register-container">
        {/* カレンダー */}
        <div className="calendar-container glass-card">
          <div className="mode-buttons">
            <button
              className={mode === "single" ? "active" : ""}
              onClick={() => setMode("single")}

              範囲選択
            </button>
            <button
              className={mode === "multi" ? "active" : ""}
              onClick={() => setMode("multi")}
            >
              複数選択
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

        {/* 選択済み日程 */}
        <div className="side-panel glass-card">
          <h3>選択中の日程</h3>
          <ul className="event-list">
            {enrichedDates.map((e, idx) => (
              <li key={idx}>
                <strong>{e.date}</strong>
                <div className="time-type-buttons">
                  {["終日", "午前", "午後", "時間指定"].map((t) => (
                    <button
                      key={t}
                      className={e.type === t ? "active" : ""}
                      onClick={() =>
                        handleTimeChange(e.date, t, e.startHour, e.endHour)
                      }
                    >
                      {t}
                    </button>
                  ))}
                  {e.type === "時間指定" && (
                    <div className="time-dropdowns">
                      <select
                        value={e.startHour || 0}
                        onChange={(ev) =>
                          handleTimeChange(
                            e.date,
                            "時間指定",
                            ev.target.value,
                            e.endHour || 1
                          )
                        }
                      >
                        {renderHourOptions()}
                      </select>
                      ～
                      <select
                        value={e.endHour || 1}
                        onChange={(ev) =>
                          handleTimeChange(
                            e.date,
                            "時間指定",
                            e.startHour || 0,
                            ev.target.value
                          )
                        }
                      >
                        {renderHourOptions()}
                      </select>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <button onClick={handleShare} className="share-btn">
            共有リンクを発行
          </button>
          {shareUrl && (
            <div className="share-link">
              <input type="text" value={shareUrl} readOnly />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
