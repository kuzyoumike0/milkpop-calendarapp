import React, { useState, useEffect } from "react";
import "../index.css";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
const hours = Array.from({ length: 24 }, (_, i) => i + 1);

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [shareUrl, setShareUrl] = useState("");
  const [globalTitle, setGlobalTitle] = useState("");
  const [selectionMode, setSelectionMode] = useState("multiple"); // ✅ デフォルト複数選択

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

  const generateCalendarDays = (month) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);

    const days = [];
    const startDayOfWeek = firstDay.getDay();

    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, monthIndex, d));
    }
    return days;
  };

  const days = generateCalendarDays(currentMonth);

  const handleDateClick = (date) => {
    if (!date) return;
    const dateStr = date.toISOString().split("T")[0];

    if (selectionMode === "multiple") {
      if (schedules.some((s) => s.date === dateStr)) {
        setSchedules(schedules.filter((s) => s.date !== dateStr));
      } else {
        setSchedules([
          ...schedules,
          { date: dateStr, timeRange: "終日", startHour: null, endHour: null },
        ]);
      }
    } else if (selectionMode === "range") {
      if (schedules.length === 0 || schedules.length > 1) {
        setSchedules([{ date: dateStr, timeRange: "終日", startHour: null, endHour: null }]);
      } else if (schedules.length === 1) {
        const startDate = new Date(schedules[0].date);
        const endDate = new Date(dateStr);

        const range = [];
        let cur = startDate < endDate ? new Date(startDate) : new Date(endDate);
        const stop = startDate < endDate ? endDate : startDate;

        while (cur <= stop) {
          range.push({
            date: cur.toISOString().split("T")[0],
            timeRange: "終日",
            startHour: null,
            endHour: null,
          });
          cur.setDate(cur.getDate() + 1);
        }
        setSchedules(range);
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

  const updateTimeRange = (dateStr, newRange) => {
    setSchedules(
      schedules.map((s) =>
        s.date === dateStr
          ? {
              ...s,
              timeRange: newRange,
              startHour: newRange === "時刻指定" ? 1 : null,
              endHour: newRange === "時刻指定" ? 24 : null,
            }
          : s
      )
    );
  };

  const updateHours = (dateStr, start, end) => {
    setSchedules(
      schedules.map((s) =>
        s.date === dateStr ? { ...s, startHour: start, endHour: end } : s
      )
    );
  };

  const deleteSchedule = (dateStr) => {
    setSchedules(schedules.filter((s) => s.date !== dateStr));
  };

  const saveSchedules = async () => {
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: globalTitle, schedules }),
      });
      const data = await res.json();
      if (data.success) {
        const shareRes = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduleIds: data.ids }),
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
      <div className="register-layout">
        {/* 左：タイトル＋カレンダー */}
        <div className="calendar-section">
          {/* タイトル */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="タイトルを入力"
              value={globalTitle}
              onChange={(e) => setGlobalTitle(e.target.value)}
              className="input-field w-full"
            />
          </div>

          {/* ✅ 範囲選択/複数選択ラジオ */}
          <div className="radio-options mb-4">
            <label className="radio-label">
              <input
                type="radio"
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
                value="range"
                checked={selectionMode === "range"}
                onChange={() => setSelectionMode("range")}
              />
              範囲選択
              <span className="custom-radio"></span>
            </label>
          </div>

          {/* 月切り替え */}
          <div className="flex justify-between items-center mb-6">
            <button onClick={prevMonth} className="nav-btn">⇦</button>
            <span className="font-bold text-lg">
              {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
            </span>
            <button onClick={nextMonth} className="nav-btn">⇨</button>
          </div>

          {/* カレンダー */}
          <div className="custom-calendar">
            {daysOfWeek.map((day, i) => (
              <div key={i} className="calendar-day-header">{day}</div>
            ))}
            {days.map((date, i) => {
              const isToday = date && date.toDateString() === today.toDateString();
              const isSelected =
                date && schedules.some((s) => s.date === date.toISOString().split("T")[0]);
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

        {/* 右：リスト */}
        <div className="schedule-section">
          <h2>選択中の日程</h2>
          {schedules.map((s, i) => (
            <div key={i} className="schedule-card relative">
              <button
                className="delete-btn absolute top-2 right-2"
                onClick={() => deleteSchedule(s.date)}
              >
                ✖
              </button>
              <div className="schedule-title">{s.date}</div>

              <select
                value={s.timeRange}
                onChange={(e) => updateTimeRange(s.date, e.target.value)}
                className="vote-select mb-2"
              >
                <option value="終日">終日</option>
                <option value="午前">午前</option>
                <option value="午後">午後</option>
                <option value="夜">夜</option>
                <option value="時刻指定">時刻指定</option>
              </select>

              {s.timeRange === "時刻指定" && (
                <div className="flex gap-3">
                  <select
                    value={s.startHour}
                    onChange={(e) =>
                      updateHours(s.date, Number(e.target.value), s.endHour)
                    }
                    className="vote-select flex-1"
                  >
                    {hours.map((h) => (
                      <option key={h} value={h}>{h}時</option>
                    ))}
                  </select>
                  <select
                    value={s.endHour}
                    onChange={(e) =>
                      updateHours(s.date, s.startHour, Number(e.target.value))
                    }
                    className="vote-select flex-1"
                  >
                    {hours.filter((h) => h > s.startHour).map((h) => (
                      <option key={h} value={h}>{h}時</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}

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
    </div>
  );
};

export default RegisterPage;
