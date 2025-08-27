import React, { useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../register.css";

const hd = new Holidays("JP");

// 日本時間の今日
const getTodayJST = () => {
  const now = new Date();
  const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  return jst;
};

// 月の日付を生成
const generateCalendar = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks = [];
  let current = new Date(firstDay);
  current.setDate(current.getDate() - current.getDay()); // 週の先頭まで戻す

  while (current <= lastDay || current.getDay() !== 0) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
};

const RegisterPage = () => {
  const today = getTodayJST();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [weeks, setWeeks] = useState([]);
  const [mode, setMode] = useState("range"); // single, multiple, range
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");

  // 日付ごとの時間帯設定
  const [timeSettings, setTimeSettings] = useState({});

  useEffect(() => {
    setWeeks(generateCalendar(currentYear, currentMonth));
  }, [currentYear, currentMonth]);

  const isSameDate = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const formatDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  const handleSelect = (date) => {
    // 単日
    if (mode === "single") {
      if (selectedDates.length === 1 && isSameDate(selectedDates[0], date)) {
        setSelectedDates([]); // 解除
      } else {
        setSelectedDates([date]);
      }
    }

    // 複数
    else if (mode === "multiple") {
      const exists = selectedDates.find((d) => isSameDate(d, date));
      if (exists) {
        setSelectedDates(selectedDates.filter((d) => !isSameDate(d, date))); // 解除
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    }

    // 範囲
    else if (mode === "range") {
      if (selectedDates.length === 0 || selectedDates.length > 1) {
        // 一回目クリック
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        // 二回目クリックで範囲
        const start = selectedDates[0];
        const range = [];
        const min = start < date ? start : date;
        const max = start > date ? start : date;
        let cur = new Date(min);
        while (cur <= max) {
          range.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(range);
      }
    }
  };

  const isSelected = (date) =>
    selectedDates.some((d) => isSameDate(d, date));

  const holiday = (date) => {
    const h = hd.isHoliday(date);
    return h ? h[0].name : null;
  };

  // 時間指定の変更処理
  const handleTimeChange = (date, type, value) => {
    const key = formatDateKey(date);
    setTimeSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], [type]: value },
    }));
  };

  return (
    <div className="register-page">
      <h1 className="page-title">MilkPOP Calendar</h1>

      <input
        type="text"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="title-input"
      />

      <div className="mode-tabs">
        <button
          className={mode === "single" ? "active" : ""}
          onClick={() => setMode("single")}
        >
          単日
        </button>
        <button
          className={mode === "multiple" ? "active" : ""}
          onClick={() => setMode("multiple")}
        >
          複数選択
        </button>
        <button
          className={mode === "range" ? "active" : ""}
          onClick={() => setMode("range")}
        >
          範囲選択
        </button>
      </div>

      <div className="calendar-container">
        <div className="calendar-box">
          <div className="calendar-header">
            <button onClick={() => setCurrentMonth(currentMonth - 1)}>◀</button>
            <span>
              {currentYear}年 {currentMonth + 1}月
            </span>
            <button onClick={() => setCurrentMonth(currentMonth + 1)}>▶</button>
          </div>

          <table className="calendar-table">
            <thead>
              <tr>
                <th className="sunday">日</th>
                <th>月</th>
                <th>火</th>
                <th>水</th>
                <th>木</th>
                <th>金</th>
                <th className="saturday">土</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, i) => (
                <tr key={i}>
                  {week.map((date, j) => {
                    const isToday = isSameDate(date, today);
                    const selected = isSelected(date);
                    const hol = holiday(date);
                    const isCurrentMonth = date.getMonth() === currentMonth;
                    return (
                      <td
                        key={j}
                        className={`cell 
                          ${isToday ? "today" : ""} 
                          ${selected ? "selected-date" : ""} 
                          ${date.getDay() === 0 ? "sunday" : ""} 
                          ${date.getDay() === 6 ? "saturday" : ""} 
                          ${!isCurrentMonth ? "other-month" : ""}`}
                        onClick={() => isCurrentMonth && handleSelect(date)}
                      >
                        {date.getDate()}
                        {hol && <div className="holiday-name">{hol}</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="selected-list">
          <h2>選択中の日程</h2>
          {selectedDates.map((d, idx) => {
            const key = formatDateKey(d);
            const setting = timeSettings[key] || {};
            return (
              <div key={idx} className="selected-card">
                <span className="date-badge">
                  {d.getFullYear()}-
                  {String(d.getMonth() + 1).padStart(2, "0")}-
                  {String(d.getDate()).padStart(2, "0")}
                </span>
                <div className="time-buttons">
                  <button className="time-btn">終日</button>
                  <button className="time-btn">昼</button>
                  <button className="time-btn">夜</button>
                  <button
                    className="time-btn"
                    onClick={() =>
                      setTimeSettings((prev) => ({
                        ...prev,
                        [key]: {
                          ...prev[key],
                          showTimeSelect: !prev[key]?.showTimeSelect,
                        },
                      }))
                    }
                  >
                    時間指定
                  </button>
                </div>

                {setting.showTimeSelect && (
                  <div className="time-selects">
                    <select
                      className="cute-select"
                      value={setting.start || ""}
                      onChange={(e) =>
                        handleTimeChange(d, "start", e.target.value)
                      }
                    >
                      <option value="">開始時刻</option>
                      {Array.from({ length: 24 }).map((_, h) => (
                        <option key={h} value={`${h}:00`}>
                          {h}:00
                        </option>
                      ))}
                    </select>
                    <span>〜</span>
                    <select
                      className="cute-select"
                      value={setting.end || ""}
                      onChange={(e) =>
                        handleTimeChange(d, "end", e.target.value)
                      }
                    >
                      <option value="">終了時刻</option>
                      {Array.from({ length: 24 }).map((_, h) => (
                        <option key={h} value={`${h}:00`}>
                          {h}:00
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
    </div>
  );
};

export default RegisterPage;
