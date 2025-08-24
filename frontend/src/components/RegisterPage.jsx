import React, { useState } from "react";
import { useNavigate } from "react-router-dom";   // ← 追加
import Holidays from "date-holidays";
import "../index.css";
import Dropdown from "./Dropdown";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [timeRanges, setTimeRanges] = useState({});
  const navigate = useNavigate();  // ← 追加

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // 📌 日付クリック処理
  const handleDateClick = (day) => {
    const date = `${currentYear}-${currentMonth + 1}-${day}`;
    if (selectionMode === "multiple") {
      setSelectedDates((prev) =>
        prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
      );
    } else if (selectionMode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = new Date(selectedDates[0]);
        const end = new Date(date);
        if (end < start) {
          setSelectedDates([date, selectedDates[0]]);
        } else {
          setSelectedDates([selectedDates[0], date]);
        }
      } else {
        setSelectedDates([date]);
      }
    }
  };

  // 📌 選択範囲を展開して表示用に変換
  const getDisplayedDates = () => {
    if (selectionMode === "multiple") {
      return selectedDates;
    }
    if (selectionMode === "range" && selectedDates.length === 2) {
      const start = new Date(selectedDates[0]);
      const end = new Date(selectedDates[1]);
      const dates = [];
      let current = new Date(start);

      while (current <= end) {
        dates.push(
          `${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`
        );
        current.setDate(current.getDate() + 1);
      }
      return dates;
    }
    return [];
  };

  // 📌 終日/午前/午後/カスタムの変更
  const handleTimeChange = (date, value) => {
    setTimeRanges((prev) => {
      if (value === "custom") {
        return {
          ...prev,
          [date]: { type: "custom", start: "00:00", end: "01:00" },
        };
      }
      return { ...prev, [date]: { type: value } };
    });
  };

  // 📌 カスタム時間の変更
  const handleCustomTimeChange = (date, field, value) => {
    setTimeRanges((prev) => ({
      ...prev,
      [date]: { ...prev[date], type: "custom", [field]: value },
    }));
  };

  // 📌 時間リスト生成（00:00〜23:00 → 表示は「〇〇時」）
  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      const hour = h.toString().padStart(2, "0");
      times.push({ value: `${hour}:00`, label: `${hour}時` });
    }
    return times;
  };

  // 📌 カレンダー描画
  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="day-cell empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const holiday = hd.isHoliday(date);
      const formattedDate = `${currentYear}-${currentMonth + 1}-${day}`;
      const isSelected =
        selectionMode === "multiple"
          ? selectedDates.includes(formattedDate)
          : selectedDates.length === 2 &&
            date >= new Date(selectedDates[0]) &&
            date <= new Date(selectedDates[1]);

      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`day-cell ${isSelected ? "selected" : ""} ${
            holiday ? "calendar-holiday" : ""
          } ${date.getDay() === 0 ? "calendar-sunday" : ""} ${
            date.getDay() === 6 ? "calendar-saturday" : ""
          } ${isToday ? "calendar-today" : ""}`}
          onClick={() => handleDateClick(day)}
        >
          <span>{day}</span>
          {holiday && <small className="holiday-name">{holiday[0].name}</small>}
        </div>
      );
    }
    return days;
  };

  // 📌 共有リンク発行処理（完了後に SharePage へ遷移）
  const generateShareLink = async () => {
    const displayedDates = getDisplayedDates();
    if (!title || displayedDates.length === 0) {
      alert("タイトルと日程を入力してください！");
      return;
    }

    const datesWithTime = displayedDates.map((d) => ({
      date: d,
      timerange: timeRanges[d] || { type: "allday" },
    }));

    const body = { title, dates: datesWithTime, memo: "" };

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.share_token) {
        navigate(`/share/${data.share_token}`); // ← SharePage に遷移
      }

      console.log("共有リンク発行成功:", data);
    } catch (err) {
      console.error("共有リンク発行エラー:", err);
      alert("共有リンクの発行に失敗しました");
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録</h2>

      {/* 入力エリア */}
      <div className="input-card">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />

        <div className="radio-group">
          <input
            type="radio"
            id="multiple"
            value="multiple"
            checked={selectionMode === "multiple"}
            onChange={() => setSelectionMode("multiple")}
          />
          <label htmlFor="multiple">複数選択</label>

          <input
            type="radio"
            id="range"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => setSelectionMode("range")}
          />
          <label htmlFor="range">範囲選択</label>
        </div>
      </div>

      {/* 横並び */}
      <div className="main-layout">
        <div className="calendar-section">
          <div className="calendar">
            <div className="calendar-header">
              <button onClick={() => setCurrentMonth(currentMonth - 1)}>←</button>
              <h3 className="month-title">
                {currentYear}年 {currentMonth + 1}月
              </h3>
              <button onClick={() => setCurrentMonth(currentMonth + 1)}>→</button>
            </div>
            <div className="week-header">
              <span>日</span>
              <span>月</span>
              <span>火</span>
              <span>水</span>
              <span>木</span>
              <span>金</span>
              <span>土</span>
            </div>
            <div className="calendar-grid">{renderDays()}</div>
          </div>
        </div>

        <div className="options-section">
          <h3>選択した日程</h3>
          <ul>
            {getDisplayedDates().map((d, i) => (
              <li key={i} className="selected-date">
                {d}
                <Dropdown
                  value={timeRanges[d]?.type || "allday"}
                  onChange={(val) => handleTimeChange(d, val)}
                />
                {timeRanges[d]?.type === "custom" && (
                  <span className="custom-time">
                    <select
                      className="custom-dropdown"
                      value={timeRanges[d]?.start || "00:00"}
                      onChange={(e) =>
                        handleCustomTimeChange(d, "start", e.target.value)
                      }
                    >
                      {generateTimeOptions().map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    〜
                    <select
                      className="custom-dropdown"
                      value={timeRanges[d]?.end || "01:00"}
                      onChange={(e) =>
                        handleCustomTimeChange(d, "end", e.target.value)
                      }
                    >
                      {generateTimeOptions().map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </span>
                )}
              </li>
            ))}
          </ul>

          <button onClick={generateShareLink} className="share-button fancy">
            ✨ 共有リンク発行 ✨
          </button>
        </div>
      </div>

      <img src="/cat.png" alt="cat" className="cat-deco" />
    </div>
  );
};

export default RegisterPage;
