// frontend/src/components/PersonalPage.jsx
import React, { useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../personal.css";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState({});
  const [mode, setMode] = useState("multiple"); // "multiple" or "range"
  const [rangeStart, setRangeStart] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedSchedules, setEditedSchedules] = useState({});

  const hd = new Holidays("JP");
  const token = localStorage.getItem("jwt");
  const todayIso = new Date().toISOString().split("T")[0];

  // ==== 初回読み込み ====
  useEffect(() => {
    if (!token) return;
    fetch("/api/personal-events", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setSchedules(arr);
        const map = {};
        arr.forEach((s) => {
          map[s.id] = Array.isArray(s.dates) ? [...s.dates] : [];
        });
        setEditedSchedules(map);
      })
      .catch((err) => console.error(err));
  }, [token]);

  // ==== 日付クリック ====
  const handleDateClick = (date) => {
    const iso = date.toISOString().split("T")[0];
    if (mode === "range") {
      if (!rangeStart) {
        setRangeStart(iso);
        return;
      }
      let start = new Date(rangeStart);
      let end = new Date(iso);
      if (end < start) [start, end] = [end, start];

      const newDates = { ...selectedDates };
      let d = new Date(start);
      while (d <= end) {
        const key = d.toISOString().split("T")[0];
        newDates[key] = {
          timeType: "allday",
          startTime: "09:00",
          endTime: "18:00",
        };
        d.setDate(d.getDate() + 1);
      }
      setSelectedDates(newDates);
      setRangeStart(null);
    } else {
      setSelectedDates((prev) => {
        const newDates = { ...prev };
        if (newDates[iso]) delete newDates[iso];
        else
          newDates[iso] = {
            timeType: "allday",
            startTime: "09:00",
            endTime: "18:00",
          };
        return newDates;
      });
    }
  };

  // ==== 個別削除 ====
  const removeSelectedDate = (date) => {
    setSelectedDates((prev) => {
      const newDates = { ...prev };
      delete newDates[date];
      return newDates;
    });
  };

  // ==== 保存 ====
  const handleSave = async () => {
    if (Object.keys(selectedDates).length === 0 || !title.trim()) {
      alert("日付とタイトルを入力してください");
      return;
    }
    if (!token) {
      alert("ログインしてください");
      return;
    }

    const datesArray = Object.entries(selectedDates).map(([date, info]) => ({
      date,
      ...info,
    }));

    const payload = { title, memo, dates: datesArray, options: {} };

    try {
      if (editingId) {
        await fetch(`/api/personal-events/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        setSchedules((prev) =>
          prev.map((s) => (s.id === editingId ? { ...s, ...payload } : s))
        );
        setEditingId(null);
      } else {
        const res = await fetch("/api/personal-events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const newItem = await res.json();
        setSchedules((prev) => [...prev, newItem]);
        setEditedSchedules((prev) => ({
          ...prev,
          [newItem.id]: Array.isArray(newItem.dates) ? [...newItem.dates] : [],
        }));
      }
      setTitle("");
      setMemo("");
      setSelectedDates({});
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  // ==== カレンダー生成 ====
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weeks = [];
  let day = new Date(firstDay);
  while (day <= lastDay) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    weeks.push(week);
  }

  return (
    <div className="personal-container">
      <h1 className="page-title">個人日程登録</h1>

      {!token ? (
        <p style={{ color: "red" }}>このページを使うにはログインしてください。</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="タイトルを入力してください"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
          />
          <textarea
            placeholder="メモを入力してください"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="memo-input"
          />

          {/* モード切替 */}
          <div className="mode-toggle">
            <label>
              <input
                type="radio"
                value="multiple"
                checked={mode === "multiple"}
                onChange={() => setMode("multiple")}
              />
              複数選択
            </label>
            <label>
              <input
                type="radio"
                value="range"
                checked={mode === "range"}
                onChange={() => setMode("range")}
              />
              範囲選択
            </label>
          </div>

          {/* 7:3 レイアウト */}
          <div className="calendar-list-container">
            {/* カレンダー（左7割） */}
            <div className="calendar-area">
              <div className="calendar-header">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                  ◀
                </button>
                <span>
                  {year}年 {month + 1}月
                </span>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                  ▶
                </button>
              </div>
              <table className="calendar-table">
                <thead>
                  <tr>
                    <th>日</th>
                    <th>月</th>
                    <th>火</th>
                    <th>水</th>
                    <th>木</th>
                    <th>金</th>
                    <th>土</th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, i) => (
                    <tr key={i}>
                      {week.map((d, j) => {
                        const iso = d.toISOString().split("T")[0];
                        const isToday = iso === todayIso;
                        const isSelected = selectedDates[iso];
                        const holiday = hd.isHoliday(d);
                        return (
                          <td
                            key={j}
                            className={`calendar-cell ${isToday ? "today" : ""} ${
                              isSelected ? "selected" : ""
                            }`}
                            onClick={() => handleDateClick(d)}
                          >
                            {d.getMonth() === month ? d.getDate() : ""}
                            {holiday && (
                              <div className="holiday-label">{holiday[0].name}</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 選択中日程（右3割） */}
            <div className="selected-area">
              <h2>選択中の日程</h2>
              {Object.entries(selectedDates).map(([date, info]) => (
                <div key={date} className="selected-date-item">
                  <span className="date-label">{date}</span>
                  <div className="time-options">
                    {["allday", "day", "night", "custom"].map((t) => (
                      <button
                        key={t}
                        className={`option-btn ${info.timeType === t ? "active" : ""}`}
                        onClick={() =>
                          setSelectedDates((prev) => ({
                            ...prev,
                            [date]: {
                              ...prev[date],
                              timeType: t,
                              ...(t === "custom"
                                ? { startTime: "09:00", endTime: "18:00" }
                                : {}),
                            },
                          }))
                        }
                      >
                        {t === "allday"
                          ? "終日"
                          : t === "day"
                          ? "午前"
                          : t === "night"
                          ? "午後"
                          : "時間指定"}
                      </button>
                    ))}
                  </div>
                  {info.timeType === "custom" && (
                    <div className="time-range">
                      <select
                        className="cute-select"
                        value={info.startTime}
                        onChange={(e) =>
                          setSelectedDates((prev) => ({
                            ...prev,
                            [date]: { ...prev[date], startTime: e.target.value },
                          }))
                        }
                      >
                        {Array.from({ length: 24 }, (_, h) => {
                          const t = `${String(h).padStart(2, "0")}:00`;
                          return (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          );
                        })}
                      </select>
                      <span className="time-separator">〜</span>
                      <select
                        className="cute-select"
                        value={info.endTime}
                        onChange={(e) =>
                          setSelectedDates((prev) => ({
                            ...prev,
                            [date]: { ...prev[date], endTime: e.target.value },
                          }))
                        }
                      >
                        {Array.from({ length: 24 }, (_, h) => {
                          const t = `${String(h).padStart(2, "0")}:00`;
                          return (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                  <button className="remove-btn" onClick={() => removeSelectedDate(date)}>
                    ✖
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 保存ボタン */}
          <button className="save-btn" onClick={handleSave}>
            {editingId ? "更新する" : "登録する"}
          </button>

          {/* 登録済み日程リスト */}
          <div className="registered-list">
            <h2>登録済み予定</h2>
            {schedules.map((item) => (
              <div key={item.id} className="schedule-card">
                <div className="schedule-header">
                  <strong>{item.title}</strong>
                  {item.memo && <p className="schedule-memo">{item.memo}</p>}
                </div>
                <ul className="schedule-dates">
                  {Array.isArray(item.dates) &&
                    item.dates.map((d, i) => (
                      <li key={i}>
                        <span>{d.date}</span> ({d.timeType})
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
