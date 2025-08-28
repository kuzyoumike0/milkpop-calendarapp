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
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [timeType, setTimeType] = useState("allday");
  const [events, setEvents] = useState([]);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  // カレンダー用
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [weeks, setWeeks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);

  // 編集状態
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    setWeeks(generateCalendar(currentYear, currentMonth));
  }, [currentYear, currentMonth]);

  // サーバーから予定取得
  useEffect(() => {
    fetch("/api/personal-events")
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("取得失敗:", err);
        setEvents([]);
      });
  }, []);

  const isSameDate = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const holiday = (date) => {
    const h = hd.isHoliday(date);
    return h ? h[0].name : null;
  };

  // 登録 or 更新
  const handleRegister = () => {
    if (!title.trim()) return alert("タイトルを入力してください");

    const payload = {
      title,
      memo,
      date: selectedDate.toISOString().split("T")[0],
      timeType,
      startTime: timeType === "custom" ? startTime : null,
      endTime: timeType === "custom" ? endTime : null,
    };

    if (editingId) {
      // 編集中 → 更新API
      fetch(`/api/personal-events/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((updated) => {
          setEvents(events.map((ev) => (ev.id === editingId ? updated : ev)));
          resetForm();
        })
        .catch((err) => console.error("更新失敗:", err));
    } else {
      // 新規登録
      fetch("/api/personal-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((saved) => {
          setEvents([...events, saved]);
          resetForm();
        })
        .catch((err) => console.error("保存失敗:", err));
    }
  };

  // 削除
  const handleDelete = (id) => {
    if (!window.confirm("この予定を削除しますか？")) return;
    fetch(`/api/personal-events/${id}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) {
          setEvents(events.filter((ev) => ev.id !== id));
        } else {
          throw new Error("削除失敗");
        }
      })
      .catch((err) => console.error(err));
  };

  // 編集開始
  const startEdit = (ev) => {
    setTitle(ev.title);
    setMemo(ev.memo || "");
    setSelectedDate(new Date(ev.date));
    setTimeType(ev.timeType);
    setStartTime(ev.startTime || "00:00");
    setEndTime(ev.endTime || "23:59");
    setEditingId(ev.id);
  };

  // フォームリセット
  const resetForm = () => {
    setTitle("");
    setMemo("");
    setTimeType("allday");
    setStartTime("00:00");
    setEndTime("23:59");
    setEditingId(null);
  };

  return (
    <div className="personal-page">
      <h1 className="page-title">個人日程登録ページ</h1>

      {/* タイトル入力 */}
      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力してください"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* メモ入力 */}
      <textarea
        className="memo-input"
        placeholder="メモを入力してください"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      {/* カレンダー & リスト */}
      <div className="calendar-list-container">
        {/* カレンダー */}
        <div className="calendar-box">
          <div className="calendar-header">
            <button onClick={() => setCurrentMonth(currentMonth - 1)}>◀</button>
            <span>
              {currentYear}年 {currentMonth + 1}月
            </span>
            <button onClick={() => setCurrentMonth(currentMonth + 1)}>▶</button>
          </div>

          <div className="calendar-grid">
            <div className="weekday-header sunday">日</div>
            <div className="weekday-header">月</div>
            <div className="weekday-header">火</div>
            <div className="weekday-header">水</div>
            <div className="weekday-header">木</div>
            <div className="weekday-header">金</div>
            <div className="weekday-header saturday">土</div>

            {weeks.map((week, wi) =>
              week.map((date, di) => {
                const isToday = isSameDate(date, today);
                const isSelected = isSameDate(date, selectedDate);
                const hol = holiday(date);
                return (
                  <div
                    key={`${wi}-${di}`}
                    className={`calendar-cell 
                      ${isToday ? "today" : ""} 
                      ${isSelected ? "selected" : ""}
                      ${date.getDay() === 0 ? "sunday" : ""} 
                      ${date.getDay() === 6 ? "saturday" : ""} 
                      ${date.getMonth() !== currentMonth ? "other-month" : ""}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="date-number">{date.getDate()}</span>
                    {hol && <span className="holiday-label">{hol}</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 登録済みリスト */}
        <div className="list-container">
          <h2>登録済みの予定</h2>
          <ul>
            {events.map((ev) => (
              <li key={ev.id || ev.date}>
                <strong>{ev.date}</strong> {ev.title} ({ev.timeType})
                {ev.memo && <p className="memo-text">📝 {ev.memo}</p>}
                <div className="event-actions">
                  <button onClick={() => startEdit(ev)}>✏️ 編集</button>
                  <button onClick={() => handleDelete(ev.id)}>❌ 削除</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 時間区分選択 */}
      <div className="time-options">
        <label>
          <input
            type="radio"
            value="allday"
            checked={timeType === "allday"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          終日
        </label>
        <label>
          <input
            type="radio"
            value="day"
            checked={timeType === "day"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          昼
        </label>
        <label>
          <input
            type="radio"
            value="night"
            checked={timeType === "night"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          夜
        </label>
        <label>
          <input
            type="radio"
            value="custom"
            checked={timeType === "custom"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          時間指定
        </label>
      </div>

      {timeType === "custom" && (
        <div className="custom-time">
          <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
            {Array.from({ length: 24 }).map((_, i) => {
              const h = String(i).padStart(2, "0");
              return (
                <option key={i} value={`${h}:00`}>
                  {`${h}:00`}
                </option>
              );
            })}
          </select>
          <span>〜</span>
          <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
            {Array.from({ length: 24 }).map((_, i) => {
              const h = String(i).padStart(2, "0");
              return (
                <option key={i} value={`${h}:00`}>
                  {`${h}:00`}
                </option>
              );
            })}
          </select>
        </div>
      )}

      <button className="register-btn" onClick={handleRegister}>
        {editingId ? "更新する" : "登録する"}
      </button>
      {editingId && (
        <button className="cancel-btn" onClick={resetForm}>
          キャンセル
        </button>
      )}
    </div>
  );
};

export default PersonalPage;
