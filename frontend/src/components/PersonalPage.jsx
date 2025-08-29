// frontend/src/components/PersonalPage.jsx
import React, { useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../personal.css";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeType, setTimeType] = useState("allday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [schedules, setSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const hd = new Holidays("JP");

  // ==== 初回読み込み ====
  useEffect(() => {
    fetch("/api/personal_schedules")
      .then((res) => res.json())
      .then((data) => setSchedules(data))
      .catch((err) => console.error(err));
  }, []);

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

  // ==== 登録処理 ====
  const handleSave = async () => {
    if (!selectedDate || !title.trim()) {
      alert("日付とタイトルを入力してください");
      return;
    }

    const payload = {
      title,
      memo,
      date: selectedDate,
      timeType,
      startTime: timeType === "custom" ? startTime : null,
      endTime: timeType === "custom" ? endTime : null,
    };

    try {
      if (editingId) {
        // 編集
        await fetch(`/api/personal_schedules/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setSchedules((prev) =>
          prev.map((s) => (s.id === editingId ? { ...s, ...payload } : s))
        );
        setEditingId(null);
      } else {
        // 新規
        const res = await fetch("/api/personal_schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const newItem = await res.json();
        setSchedules((prev) => [...prev, newItem]);
      }

      // 入力リセット
      setTitle("");
      setMemo("");
      setSelectedDate(null);
      setTimeType("allday");
      setStartTime("09:00");
      setEndTime("18:00");
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  // ==== 削除 ====
  const handleDelete = async (id) => {
    if (!window.confirm("この予定を削除しますか？")) return;

    try {
      await fetch(`/api/personal_schedules/${id}`, { method: "DELETE" });
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("削除に失敗しました");
    }
  };

  // ==== 編集開始 ====
  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setMemo(item.memo || "");
    setSelectedDate(item.date);
    setTimeType(item.timeType);
    if (item.timeType === "custom") {
      setStartTime(item.startTime || "09:00");
      setEndTime(item.endTime || "18:00");
    }
  };

  return (
    <div className="personal-container">
      <h1 className="page-title">個人日程登録</h1>

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

      {/* カレンダー */}
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
                  const holiday = hd.isHoliday(d);

                  return (
                    <td
                      key={j}
                      className={`calendar-cell 
                        ${isToday ? "today" : ""} 
                        ${selectedDate === iso ? "selected" : ""} 
                        ${holiday ? "holiday" : ""}`}
                      onClick={() => setSelectedDate(iso)}
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

      {/* 時間帯選択 */}
      <div className="time-options">
        <label>
          <input
            type="radio"
            name="timeType"
            value="allday"
            checked={timeType === "allday"}
            onChange={() => setTimeType("allday")}
          />
          終日
        </label>
        <label>
          <input
            type="radio"
            name="timeType"
            value="day"
            checked={timeType === "day"}
            onChange={() => setTimeType("day")}
          />
          午前
        </label>
        <label>
          <input
            type="radio"
            name="timeType"
            value="night"
            checked={timeType === "night"}
            onChange={() => setTimeType("night")}
          />
          午後
        </label>
        <label>
          <input
            type="radio"
            name="timeType"
            value="custom"
            checked={timeType === "custom"}
            onChange={() => setTimeType("custom")}
          />
          時間指定
        </label>
        {timeType === "custom" && (
          <span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            〜
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </span>
        )}
      </div>

      <button className="save-btn" onClick={handleSave}>
        {editingId ? "更新する" : "登録する"}
      </button>

      {/* 登録済み一覧（カレンダーの下に表示） */}
      <div className="registered-list">
        <h2>登録済み予定</h2>
        {schedules.length === 0 ? (
          <p>まだ予定がありません</p>
        ) : (
          schedules.map((item) => (
            <div key={item.id} className="schedule-item">
              <div>
                <strong>{item.title}</strong> ({item.date} / {item.timeType})
                <p>{item.memo}</p>
              </div>
              <div className="actions">
                <button onClick={() => handleEdit(item)}>✏️ 編集</button>
                <button onClick={() => handleDelete(item.id)}>🗑 削除</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
