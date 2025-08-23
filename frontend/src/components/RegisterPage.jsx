import React, { useState, useEffect } from "react";
import "../index.css";
import Footer from "./Footer";

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
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

  const handleDateClick = (date) => {
    if (selectionMode === "multiple") {
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

  // カレンダー描画
  const renderCalendar = () => {
    const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const weeks = [];
    let days = [];

    for (let i = 0; i < startDay.getDay(); i++) {
      days.push(<div key={`empty-start-${i}`} className="calendar-cell empty"></div>);
    }

    for (let d = 1; d <= endDay.getDate(); d++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
      const isSelected = selectedDates.some(
        (sd) => sd.toDateString() === date.toDateString()
      );
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <div
          key={d}
          className={`calendar-cell ${isSelected ? "selected" : ""} ${
            isToday ? "today" : ""
          } ${isHoliday(date) ? "holiday" : ""}`}
          onClick={() => handleDateClick(date)}
        >
          {d}
        </div>
      );

      if (days.length === 7) {
        weeks.push(
          <div key={`week-${weeks.length}`} className="calendar-row">
            {days}
          </div>
        );
        days = [];
      }
    }

    if (days.length > 0) {
      while (days.length < 7) {
        days.push(
          <div key={`empty-end-${days.length}`} className="calendar-cell empty"></div>
        );
      }
      weeks.push(
        <div key="last-week" className="calendar-row">
          {days}
        </div>
      );
    }

    return weeks;
  };

  return (
    <div>
      <div className="register-layout">
        {/* 左：カレンダー */}
        <div className="calendar-section">
          {/* タイトル */}
          <input
            type="text"
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field mb-4"
          />

          {/* ラジオボタン */}
          <div className="radio-options mb-4">
            <label className="radio-label">
              <input
                type="radio"
                name="mode"
                value="multiple"
                checked={selectionMode === "multiple"}
                onChange={() => setSelectionMode("multiple")}
              />
              複数選択
              <span className="custom-radio"></span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="mode"
                value="range"
                checked={selectionMode === "range"}
                onChange={() => setSelectionMode("range")}
              />
              範囲選択
              <span className="custom-radio"></span>
            </label>
          </div>

          {/* 月切替 */}
          <div className="flex items-center justify-center mb-6">
            <button
              className="nav-btn mr-6"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                )
              }
            >
              &lt;
            </button>
            <h2 className="text-2xl font-extrabold text-blue-900 tracking-wide mx-6">
              {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
            </h2>
            <button
              className="nav-btn ml-6"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                )
              }
            >
              &gt;
            </button>
          </div>

          {/* 曜日 */}
          <div className="calendar-row font-bold text-center text-blue-900 mb-2">
            {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
              <div key={i} className="calendar-day-header">
                {day}
              </div>
            ))}
          </div>

          {/* 日付 */}
          <div className="custom-calendar">{renderCalendar()}</div>
        </div>

        {/* 右：選択リスト */}
        <div className="schedule-section">
          <h2 className="text-lg font-bold mb-2">選択中の日程</h2>
          <ul className="mb-4">
            {selectedDates.map((d, i) => (
              <li key={i} className="mb-1">
                {title && <span className="schedule-title">{title}：</span>}
                {d.toLocaleDateString("ja-JP")}
                <button
                  className="delete-btn"
                  onClick={() =>
                    setSelectedDates(selectedDates.filter((_, idx) => idx !== i))
                  }
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>

          {selectedDates.length > 0 && (
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full border rounded p-2 mb-3"
            >
              <option value="終日">終日</option>
              <option value="午前">午前</option>
              <option value="午後">午後</option>
              <option value="夜">夜</option>
              <option value="時刻指定">時刻指定</option>
            </select>
          )}

          <button onClick={saveSchedules} className="save-btn">
            共有リンク発行
          </button>

          {shareUrl && (
            <div className="issued-url">
              <p className="text-sm">共有リンク:</p>
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
