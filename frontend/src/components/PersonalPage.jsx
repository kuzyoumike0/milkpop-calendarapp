// frontend/src/components/PersonalPage.jsx
import React, { useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../personal.css";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState({});
  const [mode, setMode] = useState("multiple");
  const [rangeStart, setRangeStart] = useState(null);
  const [timeType, setTimeType] = useState("allday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [schedules, setSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [shareLink, setShareLink] = useState("");

  const hd = new Holidays("JP");
  const token = localStorage.getItem("jwt");

  // ==== 初回読み込み ====
  useEffect(() => {
    if (!token) return;
    fetch("/api/personal-events", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("認証エラー");
        return res.json();
      })
      .then((data) => setSchedules(data))
      .catch((err) => console.error(err));
  }, [token]);

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

  const todayIso = new Date().toISOString().split("T")[0];

  // ==== 日付クリック ====
  const handleDateClick = (date) => {
    const iso = date.toISOString().split("T")[0];
    if (mode === "multiple") {
      setSelectedDates((prev) => {
        const newDates = { ...prev };
        if (newDates[iso]) delete newDates[iso];
        else newDates[iso] = { timeType, startTime, endTime };
        return newDates;
      });
    } else if (mode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
      } else {
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;
        const rangeDates = {};
        let d = new Date(start);
        while (d <= end) {
          const dIso = d.toISOString().split("T")[0];
          rangeDates[dIso] = { timeType, startTime, endTime };
          d.setDate(d.getDate() + 1);
        }
        setSelectedDates((prev) => ({ ...prev, ...rangeDates }));
        setRangeStart(null);
      }
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

  // ==== 個別編集 ====
  const editSelectedDate = (date) => {
    const info = selectedDates[date];
    if (!info) return;

    const newType = prompt(
      `日程(${date})の時間帯を選んでください\n1: 終日\n2: 午前\n3: 午後\n4: 時間指定`,
      "1"
    );

    let updated = { ...info };
    if (newType === "1") updated = { timeType: "allday" };
    if (newType === "2") updated = { timeType: "day" };
    if (newType === "3") updated = { timeType: "night" };
    if (newType === "4") {
      const st = prompt("開始時刻 (例: 09:00)", info.startTime || "09:00");
      const et = prompt("終了時刻 (例: 18:00)", info.endTime || "18:00");
      updated = { timeType: "custom", startTime: st, endTime: et };
    }

    setSelectedDates((prev) => ({
      ...prev,
      [date]: updated,
    }));
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
      }

      setTitle("");
      setMemo("");
      setSelectedDates({});
      setTimeType("allday");
      setStartTime("09:00");
      setEndTime("18:00");
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="personal-container">
      <h1 className="page-title">個人日程登録</h1>

      {!token ? (
        <p style={{ color: "red" }}>このページを使うにはログインしてください。</p>
      ) : (
        <>
          {/* 入力欄 */}
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
          <div className="select-mode">
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

          <div className="calendar-list-container">
            {/* ==== カレンダー ==== */}
            <div className="calendar-container">
              <div className="calendar-header">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                  ◀
                </button>
                <span>{year}年 {month + 1}月</span>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                  ▶
                </button>
              </div>

              <table className="calendar-table">
                <thead>
                  <tr>
                    <th>日</th><th>月</th><th>火</th><th>水</th>
                    <th>木</th><th>金</th><th>土</th>
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
                            className={`cell
                              ${isToday ? "today" : ""}
                              ${isSelected ? "selected" : ""}
                              ${holiday ? "holiday" : ""}
                              ${j === 0 ? "sunday" : ""}
                              ${j === 6 ? "saturday" : ""}`}
                            onClick={() => handleDateClick(d)}
                          >
                            {d.getMonth() === month ? d.getDate() : ""}
                            {holiday && <div className="holiday-name">{holiday[0].name}</div>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              <button className="register-btn" onClick={handleSave}>
                {editingId ? "更新する" : "登録する"}
              </button>
            </div>

            {/* ==== 選択済み ==== */}
            <div className="registered-list">
              <h2>選択済み日程</h2>
              {Object.keys(selectedDates).length === 0 ? (
                <p style={{ color: "white" }}>まだ日程が選択されていません</p>
              ) : (
                Object.entries(selectedDates)
                  .sort(([a], [b]) => new Date(a) - new Date(b))
                  .map(([date, info]) => (
                    <div key={date} className="schedule-card">
                      <div className="schedule-header">
                        <strong className="schedule-title">{date}</strong>
                      </div>
                      <ul className="schedule-dates">
                        <li>
                          <span className="time-label">
                            {info.timeType === "allday"
                              ? "終日"
                              : info.timeType === "day"
                              ? "午前"
                              : info.timeType === "night"
                              ? "午後"
                              : `${info.startTime}〜${info.endTime}`}
                          </span>
                        </li>
                      </ul>
                      <div className="schedule-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => editSelectedDate(date)}
                        >
                          ✏️ 編集
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => removeSelectedDate(date)}
                        >
                          ❌ 削除
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
