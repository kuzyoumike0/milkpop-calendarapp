// frontend/src/components/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import "../index.css";
import Header from "./Header";
import Footer from "./Footer";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("single");
  const [title, setTitle] = useState("");
  const [timeRange, setTimeRange] = useState("終日");
  const [holidays, setHolidays] = useState([]);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    fetch(`/api/holidays/${today.getFullYear()}`)
      .then((res) => res.json())
      .then((data) => setHolidays(data))
      .catch((err) => console.error("Error fetching holidays:", err));
  }, []);

  const isHoliday = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return holidays.some((h) => h.date.startsWith(dateStr));
  };

  // 今月の日付を生成
  const generateCalendarDays = (month) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);

    const days = [];
    const startDayOfWeek = firstDay.getDay();

    // 前月の空白
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    // 今月の日付
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, monthIndex, d));
    }

    return days;
  };

  const days = generateCalendarDays(currentMonth);

  const handleDateClick = (date) => {
    if (!date) return;

    if (selectionMode === "single") {
      setSelectedDates([date]);
    } else if (selectionMode === "multiple") {
      const exists = selectedDates.some(
        (d) => d.toDateString() === date.toDateString()
      );
      if (exists) {
        setSelectedDates(selectedDates.filter((d) => d.toDateString() !== date.toDateString()));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else if (selectionMode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0] < date ? selectedDates[0] : date;
        const end = selectedDates[0] < date ? date : selectedDates[0];
        const range = [];
        let cur = new Date(start);
        while (cur <= end) {
          range.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(range);
      } else {
        setSelectedDates([date]);
      }
    }
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const saveSchedules = async () => {
    try {
      const formattedDates = selectedDates.map((d) =>
        d.toISOString().split("T")[0]
      );
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dates: formattedDates, timeRange }),
      });
      const data = await res.json();
      if (data.success) {
        const shareRes = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduleIds: [data.id] }),
        });
        const shareData = await shareRes.json();
        if (shareData.success) {
          setShareUrl(window.location.origin + shareData.url);
        }
      }
    } catch (err) {
      console.error("Error saving schedule:", err);
    }
  };

  return (
    <div className="register-page">
      <Header />

      <div className="register-layout">
        {/* 左：カレンダー */}
        <div className="calendar-section">
          {/* 選択モード */}
          <div className="radio-options mb-4">
            <label className="radio-label">
              <input
                type="radio"
                name="mode"
                value="single"
                checked={selectionMode === "single"}
                onChange={() => setSelectionMode("single")}
              />
              <span className="custom-radio"></span>単日
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="mode"
                value="multiple"
                checked={selectionMode === "multiple"}
                onChange={() => setSelectionMode("multiple")}
              />
              <span className="custom-radio"></span>複数
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="mode"
                value="range"
                checked={selectionMode === "range"}
                onChange={() => setSelectionMode("range")}
              />
              <span className="custom-radio"></span>範囲
            </label>
          </div>

          {/* 月切り替え */}
          <div className="flex justify-between items-center mb-2">
            <button onClick={prevMonth} className="month-btn">◀</button>
            <span className="font-bold text-lg">
              {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
            </span>
            <button onClick={nextMonth} className="month-btn">▶</button>
          </div>

          {/* 自作カレンダー */}
          <div className="custom-calendar">
            {daysOfWeek.map((day, i) => (
              <div key={i} className="calendar-day-header">{day}</div>
            ))}
            {days.map((date, i) => {
              const isToday = date && date.toDateString() === today.toDateString();
              const isSelected = date && selectedDates.some((d) => d.toDateString() === date.toDateString());
              const isHolidayDay = date && isHoliday(date);

              return (
                <div
                  key={i}
                  className={`calendar-cell 
                    ${isToday ? "today" : ""} 
                    ${isSelected ? "selected" : ""} 
                    ${isHolidayDay ? "holiday" : ""}`}
                  onClick={() => handleDateClick(date)}
                >
                  {date ? date.getDate() : ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* 右：選択済みリスト */}
        <div className="schedule-section">
          <h2>選択中の日程</h2>
          <ul>
            {selectedDates.map((d, i) => (
              <li key={i}>{d.toLocaleDateString("ja-JP")}</li>
            ))}
          </ul>

          <input
            type="text"
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field mb-3"
          />

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="vote-select mb-3"
          >
            <option value="終日">終日</option>
            <option value="午前">午前</option>
            <option value="午後">午後</option>
            <option value="夜">夜</option>
            <option value="時刻指定">時刻指定</option>
          </select>

          <button onClick={saveSchedules} className="save-btn">
            共有リンク発行
          </button>

          {shareUrl && (
            <div className="issued-url">
              <a href={shareUrl}>{shareUrl}</a>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterPage;
