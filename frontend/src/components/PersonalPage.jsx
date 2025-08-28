// frontend/src/components/PersonalPage.jsx
import React, { useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../personal.css";

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
  current.setDate(current.getDate() - current.getDay());

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

const PersonalPage = () => {
  const today = getTodayJST();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [weeks, setWeeks] = useState([]);
  const [mode, setMode] = useState("single"); // 単日 / 複数 / 範囲
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [timeSettings, setTimeSettings] = useState({});
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setWeeks(generateCalendar(currentYear, currentMonth));
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetch("/api/personal-events")
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]));
  }, []);

  const isSameDate = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const formatDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  // 日付クリック処理
  const handleSelect = (date) => {
    const exists = selectedDates.find((d) => isSameDate(d, date));
    if (exists) {
      setSelectedDates(selectedDates.filter((d) => !isSameDate(d, date)));
      return;
    }

    if (mode === "single") {
      setSelectedDates([date]);
    } else if (mode === "multiple") {
      setSelectedDates([...selectedDates, date]);
    } else if (mode === "range") {
      if (selectedDates.length === 0 || selectedDates.length > 1) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
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

  const isSelected = (date) => selectedDates.some((d) => isSameDate(d, date));

  const holiday = (date) => {
    const h = hd.isHoliday(date);
    return h ? h[0].name : null;
  };

  // 時間区分切替
  const toggleTime = (date, type) => {
    const key = formatDateKey(date);
    setTimeSettings((prev) => {
      const current = prev[key] || {};
      return { ...prev, [key]: { ...current, timeType: type } };
    });
  };

  // 保存
  const handleRegister = () => {
    if (!title.trim()) return alert("タイトルを入力してください");

    const newEvent = {
      title,
      memo,
      dates: selectedDates.map((d) => {
        const key = formatDateKey(d);
        const setting = timeSettings[key] || {};
        return {
          date: key,
          timeType: setting.timeType || "終日",
          startTime: setting.start || null,
          endTime: setting.end || null,
        };
      }),
      options: {},
    };

    fetch("/api/personal-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    })
      .then((res) => res.json())
      .then((saved) => {
        setEvents([...events, saved]);
        setTitle("");
        setMemo("");
        setSelectedDates([]);
      })
      .catch((err) => console.error("保存失敗:", err));
  };

  return (
    <div className="personal-page">
      <h1 className="page-title">個人日程登録ページ</h1>

      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力してください"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="memo-input"
        placeholder="メモを入力してください"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      {/* モード切替 */}
      <div className="mode-tabs">
        <button onClick={() => setMode("single")} className={mode === "single" ? "active" : ""}>
          単日
        </button>
        <button onClick={() => setMode("multiple")} className={mode === "multiple" ? "active" : ""}>
          複数選択
        </button>
        <button onClick={() => setMode("range")} className={mode === "range" ? "active" : ""}>
          範囲選択
        </button>
      </div>

      {/* カレンダー */}
      <div className="calendar-list-container">
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
                        className={`cell ${isToday ? "today" : ""} ${
                          selected ? "selected-date" : ""
                        } ${date.getDay() === 0 ? "sunday" : ""} ${
                          date.getDay() === 6 ? "saturday" : ""
                        } ${!isCurrentMonth ? "other-month" : ""}`}
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

        {/* 選択中の日程 */}
        <div className="selected-list">
          <h2>選択中の日程</h2>
          {[...selectedDates]
            .sort((a, b) => a - b)
            .map((d, idx) => {
              const key = formatDateKey(d);
              const setting = timeSettings[key] || {};
              return (
                <div key={idx} className="selected-card">
                  <span className="date-badge">{key}</span>
                  <div className="time-buttons">
                    {["終日", "午前", "午後"].map((label) => (
                      <button
                        key={label}
                        className={`time-btn ${setting.timeType === label ? "active" : ""}`}
                        onClick={() => toggleTime(d, label)}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      className={`time-btn ${setting.timeType === "時間指定" ? "active" : ""}`}
                      onClick={() => toggleTime(d, "時間指定")}
                    >
                      時間指定
                    </button>
                    {setting.timeType === "時間指定" && (
                      <div className="time-selects">
                        <select
                          value={setting.start || "09:00"}
                          onChange={(e) =>
                            setTimeSettings((prev) => ({
                              ...prev,
                              [key]: { ...setting, start: e.target.value },
                            }))
                          }
                          className="cute-select"
                        >
                          {Array.from({ length: 24 }).map((_, i) => {
                            const h = String(i).padStart(2, "0");
                            return (
                              <option key={i} value={`${h}:00`}>
                                {h}:00
                              </option>
                            );
                          })}
                        </select>
                        <span>〜</span>
                        <select
                          value={setting.end || "18:00"}
                          onChange={(e) =>
                            setTimeSettings((prev) => ({
                              ...prev,
                              [key]: { ...setting, end: e.target.value },
                            }))
                          }
                          className="cute-select"
                        >
                          {Array.from({ length: 24 }).map((_, i) => {
                            const h = String(i).padStart(2, "0");
                            return (
                              <option key={i} value={`${h}:00`}>
                                {h}:00
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          <button className="register-btn" onClick={handleRegister}>
            登録する
          </button>
        </div>
      </div>

      {/* 登録済みの予定 */}
      <div className="events-list">
        <h2>登録済みの予定</h2>
        <ul>
          {events.map((ev) => (
            <li key={ev.id} className="event-item">
              <strong>{ev.title}</strong>
              {ev.dates.map((d, idx) => (
                <div key={idx}>
                  📅 {d.date}（{d.timeType}）
                  {d.timeType === "時間指定" && d.startTime && d.endTime && (
                    <span> {d.startTime}〜{d.endTime}</span>
                  )}
                </div>
              ))}
              {ev.memo && <p className="memo-text">📝 {ev.memo}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PersonalPage;
