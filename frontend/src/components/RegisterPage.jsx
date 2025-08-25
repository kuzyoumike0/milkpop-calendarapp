// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Holidays from "date-holidays";
import { v4 as uuidv4 } from "uuid";   // ← uuidでユニークなリンクID生成
import "../register.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [timeRanges, setTimeRanges] = useState({});

  const [rangeStart, setRangeStart] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  const [shareLink, setShareLink] = useState(null); // ✅ 発行された共有リンクを保持

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // ===== 日付クリック処理 =====
  const handleDateClick = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    if (selectionMode === "multiple") {
      setSelectedDates((prev) =>
        prev.includes(dateStr)
          ? prev.filter((d) => d !== dateStr)
          : [...prev, dateStr].sort()
      );
    } else if (selectionMode === "range") {
      if (!rangeStart) {
        setRangeStart(dateStr);
        setSelectedDates([dateStr]);
      } else {
        const start = new Date(rangeStart);
        const end = new Date(dateStr);
        const range = [];
        const step = start < end ? 1 : -1;

        for (let d = new Date(start); ; d.setDate(d.getDate() + step)) {
          range.push(d.toISOString().split("T")[0]);
          if (
            (step > 0 && d.getTime() >= end.getTime()) ||
            (step < 0 && d.getTime() <= end.getTime())
          ) {
            break;
          }
        }

        setSelectedDates(range.sort());
        setRangeStart(null);
        setHoverDate(null);
      }
    }
  };

  // ===== 時間帯変更処理 =====
  const handleTimeChange = (date, field, value) => {
    setTimeRanges((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: value,
      },
    }));
  };

  // ===== 共有リンク発行 =====
  const generateShareLink = () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日程を入力してください。");
      return;
    }

    const token = uuidv4(); // ランダムなリンクID
    const schedules = selectedDates.map((d) => ({
      date: d,
      time: timeRanges[d]?.type || "終日",
    }));

    // localStorageに保存
    localStorage.setItem(
      `schedule_${token}`,
      JSON.stringify({ title, schedules })
    );

    // 生成したリンクを保持
    const link = `${window.location.origin}/share/${token}`;
    setShareLink(link);
  };

  // ===== カレンダー描画 =====
  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const dateStr = dateObj.toISOString().split("T")[0];

      const isSelected = selectedDates.includes(dateStr);
      const holiday = hd.isHoliday(dateObj);
      const isToday = dateStr === todayStr;

      let inRange = false;
      if (rangeStart && hoverDate) {
        const start = new Date(rangeStart);
        const end = new Date(hoverDate);
        if (start <= end) {
          inRange = dateObj > start && dateObj < end;
        } else {
          inRange = dateObj < start && dateObj > end;
        }
      }

      days.push(
        <div
          key={day}
          className={`calendar-day 
            ${isSelected ? "selected" : ""} 
            ${holiday ? "holiday" : ""} 
            ${isToday ? "today" : ""} 
            ${inRange ? "in-range" : ""}`}
          onClick={() => handleDateClick(day)}
          onMouseEnter={() => rangeStart && setHoverDate(dateStr)}
        >
          <div className="day-number">{day}</div>
          {holiday && <div className="holiday-name">{holiday[0].name}</div>}
        </div>
      );
    }
    return days;
  };

  // 時刻選択用の選択肢
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    const label = `${String(h).padStart(2, "0")}:00`;
    timeOptions.push(label);
  }

  return (
    <div className="register-page">
      <h2>日程登録</h2>

      {/* タイトル */}
      <div className="calendar-title-input">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 選択モード */}
      <div className="selection-mode">
        <label
          className={`mode-option ${
            selectionMode === "multiple" ? "active" : ""
          }`}
        >
          <input
            type="radio"
            value="multiple"
            checked={selectionMode === "multiple"}
            onChange={() => setSelectionMode("multiple")}
          />
          複数選択
        </label>
        <label
          className={`mode-option ${
            selectionMode === "range" ? "active" : ""
          }`}
        >
          <input
            type="radio"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => setSelectionMode("range")}
          />
          範囲選択
        </label>
      </div>

      {/* カレンダーとリストを横並び */}
      <div className="calendar-layout">
        <div className="calendar">
          <div className="calendar-header">
            <button onClick={() => setCurrentMonth((m) => m - 1)}>◀</button>
            <span>
              {currentYear}年 {currentMonth + 1}月
            </span>
            <button onClick={() => setCurrentMonth((m) => m + 1)}>▶</button>
          </div>
          <div className="calendar-grid">{renderCalendar()}</div>
        </div>

        {/* 選択日程 + 時間帯 */}
        <div className="selected-list">
          <h3>選択した日程</h3>
          <ul>
            {selectedDates.map((d) => (
              <li key={d} className="selected-item">
                <span className="selected-date">{d}</span>
                <select
                  className="styled-dropdown"
                  value={timeRanges[d]?.type || "終日"}
                  onChange={(e) => handleTimeChange(d, "type", e.target.value)}
                >
                  <option value="終日">終日</option>
                  <option value="昼">昼</option>
                  <option value="夜">夜</option>
                  <option value="時刻">時刻指定</option>
                </select>

                {timeRanges[d]?.type === "時刻" && (
                  <div className="time-range">
                    <select
                      className="styled-dropdown"
                      value={timeRanges[d]?.start || "09:00"}
                      onChange={(e) =>
                        handleTimeChange(d, "start", e.target.value)
                      }
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    ～
                    <select
                      className="styled-dropdown"
                      value={timeRanges[d]?.end || "18:00"}
                      onChange={(e) =>
                        handleTimeChange(d, "end", e.target.value)
                      }
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* ✅ 共有リンク発行ボタン */}
          <button className="share-button" onClick={generateShareLink}>
            共有リンクを発行
          </button>
          {shareLink && (
            <div className="share-link-box">
              <a href={shareLink} target="_blank" rel="noopener noreferrer">
                {shareLink}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  alert("リンクをコピーしました！");
                }}
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
