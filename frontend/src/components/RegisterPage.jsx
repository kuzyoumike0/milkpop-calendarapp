// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Holidays from "date-holidays";
import "../index.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [timeOptions, setTimeOptions] = useState({}); // { date: { type: "all"|"day"|"night"|"custom", start: "09:00", end: "18:00" } }

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // 範囲展開
  const expandRange = (start, end) => {
    let s = new Date(start);
    let e = new Date(end);
    if (e < s) [s, e] = [e, s];
    const range = [];
    const cur = new Date(s);
    while (cur <= e) {
      range.push(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return range;
  };

  // 表示用日程
  const getDisplayedDates = () => {
    if (selectionMode === "range" && selectedDates.length === 2) {
      return expandRange(selectedDates[0], selectedDates[1]).sort();
    }
    return [...selectedDates].sort();
  };

  const displayedDates = getDisplayedDates();

  // 日付クリック
  const handleDateClick = (date) => {
    if (selectionMode === "multiple") {
      setSelectedDates((prev) =>
        prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
      );
    } else if (selectionMode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        setSelectedDates([selectedDates[0], date]);
      } else {
        setSelectedDates([date]); // 新しく選び直し
      }
    }
  };

  // 月移動
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  // 時間帯変更
  const handleTimeChange = (date, field, value) => {
    setTimeOptions((prev) => ({
      ...prev,
      [date]: {
        ...(prev[date] || { type: "all", start: "09:00", end: "18:00" }),
        [field]: value,
      },
    }));
  };

  // 共有リンク生成
  const handleShare = async () => {
    if (!title || displayedDates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          dates: displayedDates,
          options: { times: timeOptions },
        }),
      });
      const data = await res.json();
      if (data.share_token) {
        navigate(`/share/${data.share_token}`);
      } else {
        alert("共有リンクの生成に失敗しました");
      }
    } catch (err) {
      console.error(err);
      alert("サーバーエラー");
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) =>
    `${i.toString().padStart(2, "0")}:00`
  );

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録ページ</h2>

      {/* 入力フォーム */}
      <div className="input-card">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />

        {/* 複数 / 範囲 ラジオ */}
        <div className="radio-group">
          <input
            type="radio"
            id="multiple"
            value="multiple"
            checked={selectionMode === "multiple"}
            onChange={() => setSelectionMode("multiple")}
          />
          <label htmlFor="multiple">複数</label>

          <input
            type="radio"
            id="range"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => setSelectionMode("range")}
          />
          <label htmlFor="range">範囲</label>
        </div>
      </div>

      {/* 横並びレイアウト */}
      <div className="main-layout">
        {/* カレンダー */}
        <div className="calendar-section">
          <div className="calendar">
            <div className="calendar-header">
              <button onClick={prevMonth}>←</button>
              <h3 className="month-title">
                {currentYear}年 {currentMonth + 1}月
              </h3>
              <button onClick={nextMonth}>→</button>
            </div>

            <div className="week-header">
              {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="calendar-grid">
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, idx) => {
                const date = new Date(currentYear, currentMonth, idx + 1);
                const dateStr = date.toISOString().split("T")[0];
                const isSelected = displayedDates.includes(dateStr);
                const holiday = hd.isHoliday(date);
                const isSunday = date.getDay() === 0;
                const isSaturday = date.getDay() === 6;
                const isToday =
                  date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={dateStr}
                    onClick={() => handleDateClick(dateStr)}
                    className={`day-cell ${isSelected ? "selected" : ""} ${
                      holiday ? "calendar-holiday" : ""
                    } ${isSunday ? "calendar-sunday" : ""} ${
                      isSaturday ? "calendar-saturday" : ""
                    } ${isToday ? "calendar-today" : ""}`}
                  >
                    {idx + 1}
                    {holiday && (
                      <div className="holiday-name">{holiday.name}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 選択リスト */}
        <div className="options-section">
          <h3>選択した日程</h3>
          {displayedDates.map((d) => {
            const opt = timeOptions[d] || { type: "all", start: "09:00", end: "18:00" };
            return (
              <div key={d} className="selected-date">
                <span>{d}</span>
                {/* 時間帯プルダウン */}
                <select
                  value={opt.type}
                  onChange={(e) => handleTimeChange(d, "type", e.target.value)}
                  className="custom-dropdown"
                >
                  <option value="all">終日</option>
                  <option value="day">昼</option>
                  <option value="night">夜</option>
                  <option value="custom">時刻指定</option>
                </select>

                {/* 時刻指定のときに追加のプルダウン表示 */}
                {opt.type === "custom" && (
                  <div className="custom-time">
                    <select
                      value={opt.start}
                      onChange={(e) =>
                        handleTimeChange(d, "start", e.target.value)
                      }
                      className="custom-dropdown"
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    ～
                    <select
                      value={opt.end}
                      onChange={(e) =>
                        handleTimeChange(d, "end", e.target.value)
                      }
                      className="custom-dropdown"
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 共有ボタン */}
      <button onClick={handleShare} className="share-button fancy">
        共有リンクを発行
      </button>
    </div>
  );
};

export default RegisterPage;
