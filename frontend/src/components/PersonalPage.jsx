// frontend/src/components/PersonalPage.jsx
import React, { useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../personal.css";

export default function PersonalPage({ user }) {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState("single"); // "single" | "multiple" | "range"
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeType, setTimeType] = useState("allday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [schedules, setSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [shareLink, setShareLink] = useState("");

  const hd = new Holidays("JP");

  // ==== 初回読み込み ====
  useEffect(() => {
    fetch("/api/personal-events", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("認証エラー");
        return res.json();
      })
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

  // ==== 日付クリック処理 ====
  const handleDateClick = (iso) => {
    if (mode === "single") {
      setSelectedDates([iso]);
    } else if (mode === "multiple") {
      setSelectedDates((prev) =>
        prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]
      );
    } else if (mode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([iso]);
      } else if (selectedDates.length === 1) {
        let start = new Date(selectedDates[0]);
        let end = new Date(iso);
        if (start > end) [start, end] = [end, start];
        const range = [];
        let d = new Date(start);
        while (d <= end) {
          range.push(d.toISOString().split("T")[0]);
          d.setDate(d.getDate() + 1);
        }
        setSelectedDates(range);
      } else {
        setSelectedDates([iso]); // リセットして新規範囲開始
      }
    }
  };

  // ==== 登録処理 ====
  const handleSave = async () => {
    if (selectedDates.length === 0 || !title.trim()) {
      alert("日付とタイトルを入力してください");
      return;
    }

    const payload = {
      title,
      memo,
      dates: selectedDates.map((date) => ({
        date,
        timeType,
        startTime,
        endTime,
      })),
      options: {},
    };

    try {
      if (editingId) {
        await fetch(`/api/personal-events/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        setSchedules((prev) =>
          prev.map((s) => (s.id === editingId ? { ...s, ...payload } : s))
        );
        setEditingId(null);
      } else {
        const res = await fetch("/api/personal-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const newItem = await res.json();
        setSchedules((prev) => [...prev, newItem]);
      }

      // 入力リセット
      setTitle("");
      setMemo("");
      setSelectedDates([]);
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
      await fetch(`/api/personal-events/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
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
    setSelectedDates(item.dates.map((d) => d.date));
    setTimeType(item.dates?.[0]?.timeType || "allday");
    if (item.dates?.[0]?.timeType === "custom") {
      setStartTime(item.dates?.[0]?.startTime || "09:00");
      setEndTime(item.dates?.[0]?.endTime || "18:00");
    }
  };

  // ==== 共有リンク発行 ====
  const handleShare = async (id) => {
    try {
      const res = await fetch(`/api/personal-events/${id}/share`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      setShareLink(`${window.location.origin}/personal/${data.share_token}`);
    } catch (err) {
      console.error(err);
      alert("共有リンク発行に失敗しました");
    }
  };

  return (
    <div className="personal-container">
      <h1 className="page-title">個人日程登録</h1>
      <p>ようこそ、{user?.username} さん！</p>

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
      <div className="mode-switch">
        <label>
          <input
            type="radio"
            value="single"
            checked={mode === "single"}
            onChange={() => setMode("single")}
          />{" "}
          単日
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={mode === "multiple"}
            onChange={() => setMode("multiple")}
          />{" "}
          複数
        </label>
        <label>
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />{" "}
          範囲
        </label>
      </div>

      {/* カレンダー */}
      <div className="calendar-container">
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
                  const holiday = hd.isHoliday(d);
                  const isSelected = selectedDates.includes(iso);

                  return (
                    <td
                      key={j}
                      className={`calendar-cell 
                        ${isToday ? "today" : ""} 
                        ${isSelected ? "selected" : ""} 
                        ${holiday ? "holiday" : ""}`}
                      onClick={() => handleDateClick(iso)}
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

      {/* 登録済み一覧 */}
      <div className="registered-list">
        <h2>登録済み予定</h2>
        {schedules.length === 0 ? (
          <p>まだ予定がありません</p>
        ) : (
          schedules.map((item) => (
            <div key={item.id} className="schedule-item">
              <div>
                <strong>{item.title}</strong>
                <p>{item.memo}</p>
              </div>
              <div>
                {item.dates.map((d, idx) => (
                  <div key={idx}>
                    {d.date} / {d.timeType}
                  </div>
                ))}
              </div>
              <div className="actions">
                <button onClick={() => handleEdit(item)}>✏️ 編集</button>
                <button onClick={() => handleDelete(item.id)}>🗑 削除</button>
                <button onClick={() => handleShare(item.id)}>🔗 共有リンク発行</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 共有リンク表示 */}
      {shareLink && (
        <div className="share-link-box">
          <a href={shareLink} target="_blank" rel="noreferrer">
            {shareLink}
          </a>
          <button onClick={() => navigator.clipboard.writeText(shareLink)}>
            コピー
          </button>
        </div>
      )}
    </div>
  );
}
