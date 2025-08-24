// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Holidays from "date-holidays";
import "../index.css";
import Dropdown from "./Dropdown";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [timeRanges, setTimeRanges] = useState({});
  const [shareLink, setShareLink] = useState("");
  const navigate = useNavigate();

  // 日本時間の今日
  const jstNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );
  const [currentMonth, setCurrentMonth] = useState(jstNow.getMonth());
  const [currentYear, setCurrentYear] = useState(jstNow.getFullYear());
  const hd = new Holidays("JP");

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // 📌 日付クリック
  const handleDateClick = (day) => {
    const date = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

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

  // 📌 範囲展開
  const getDisplayedDates = () => {
    if (selectionMode === "multiple") return selectedDates;

    if (selectionMode === "range" && selectedDates.length === 2) {
      const start = new Date(selectedDates[0]);
      const end = new Date(selectedDates[1]);
      const dates = [];
      let current = new Date(start);
      while (current <= end) {
        dates.push(
          `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(current.getDate()).padStart(2, "0")}`
        );
        current.setDate(current.getDate() + 1);
      }
      return dates;
    }
    return selectedDates;
  };

  // 📌 時間帯変更
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

  // 📌 時間指定の変更
  const handleCustomTimeChange = (date, field, value) => {
    setTimeRanges((prev) => ({
      ...prev,
      [date]: { ...prev[date], type: "custom", [field]: value },
    }));
  };

  // 📌 時刻リスト生成
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
      const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const holiday = hd.isHoliday(date);
      const isSelected =
        selectionMode === "multiple"
          ? selectedDates.includes(formattedDate)
          : selectedDates.length === 2 &&
            date >= new Date(selectedDates[0]) &&
            date <= new Date(selectedDates[1]);
      const isToday =
        date.getFullYear() === jstNow.getFullYear() &&
        date.getMonth() === jstNow.getMonth() &&
        date.getDate() === jstNow.getDate();

      days.push(
        <div
          key={day}
          className={`day-cell ${isSelected ? "selected" : ""} ${
            holiday ? "calendar-holiday" : ""
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

// 📌 共有リンク発行
const generateShareLink = async () => {
  const displayedDates = getDisplayedDates();
  if (!title || displayedDates.length === 0) {
    alert("タイトルと日程を入力してください！");
    return;
  }

  const body = { title, dates: displayedDates, timeRanges };

  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL || ""}/api/schedules`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();

    if (data.share_token) {
      // ✅ React Router のルートに合わせる
      const url = `/share/${data.share_token}`;
      setShareLink(url);
    } else {
      alert("共有リンクの発行に失敗しました");
    }
  } catch (err) {
    console.error("共有リンク発行エラー:", err);
    alert("共有リンクの発行に失敗しました");
  }
};


  return (
    <div className="page-container">
      <h2 className="page-title">日程登録</h2>

      <div className="input-card">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />

        {/* 複数選択 / 範囲選択ラジオ */}
        <div className="radio-group">
          <label
            className={`radio-label ${
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
            className={`radio-label ${
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

        <div className="mt-2 text-sm text-gray-200">
          現在のモード:{" "}
          <span className="font-bold text-yellow-300">
            {selectionMode === "multiple" ? "複数選択" : "範囲選択"}
          </span>
        </div>
      </div>

      {/* カレンダー + 選択リスト */}
      <div className="main-layout">
        <div className="calendar-section">
          <div className="calendar">
            <div className="calendar-header">
              <button onClick={() => setCurrentMonth(currentMonth - 1)}>←</button>
              <h3>
                {currentYear}年 {currentMonth + 1}月
              </h3>
              <button onClick={() => setCurrentMonth(currentMonth + 1)}>→</button>
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
        </div>
      </div>

      {/* 共有リンク発行 */}
      <button onClick={generateShareLink} className="share-button fancy">
        🔗 共有リンク発行
      </button>

      {shareLink && (
        <div className="share-link">
          <p>共有リンク:</p>
          <a href={shareLink} className="underline text-blue-200">
            {shareLink}
          </a>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
