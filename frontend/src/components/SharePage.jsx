import React, { useState, useEffect } from "react";
import axios from "axios";

export default function SharePage() {
  const [events, setEvents] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("single"); // "range" or "multi"
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("終日");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("01:00");

  // 共有イベントを取得
  useEffect(() => {
    axios.get("/api/shared").then((res) => setEvents(res.data));
  }, []);

  // 日付クリック時
  const handleDateClick = (date) => {
    if (selectionMode === "single") {
      setSelectedDates([date]);
    } else if (selectionMode === "multi") {
      if (selectedDates.includes(date)) {
        setSelectedDates(selectedDates.filter((d) => d !== date));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else if (selectionMode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = new Date(selectedDates[0]);
        const end = new Date(date);
        if (start > end) [start, end] = [end, start];
        const range = [];
        let cur = new Date(start);
        while (cur <= end) {
          range.push(cur.toISOString().split("T")[0]);
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(range);
      } else {
        setSelectedDates([date]);
      }
    }
  };

  // 保存処理
  const handleSave = async () => {
    if (!title || selectedDates.length === 0) return alert("タイトルと日付を入力してください");
    const newEvent = {
      id: Date.now(),
      title,
      dates: selectedDates,
      category,
      startTime,
      endTime,
    };
    await axios.post("/api/personal", newEvent);
    setEvents([...events, newEvent]);
    setTitle("");
    setSelectedDates([]);
  };

  // 時刻プルダウン生成
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      timeOptions.push(`${hh}:${mm}`);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>🌐 共有カレンダー</h2>

      {/* 選択モード */}
      <div>
        <label>
          <input
            type="radio"
            value="single"
            checked={selectionMode === "single"}
            onChange={(e) => setSelectionMode(e.target.value)}
          />
          単日
        </label>
        <label>
          <input
            type="radio"
            value="multi"
            checked={selectionMode === "multi"}
            onChange={(e) => setSelectionMode(e.target.value)}
          />
          複数
        </label>
        <label>
          <input
            type="radio"
            value="range"
            checked={selectionMode === "range"}
            onChange={(e) => setSelectionMode(e.target.value)}
          />
          範囲
        </label>
      </div>

      {/* タイトル入力 */}
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 区分 */}
      <div style={{ marginTop: "10px" }}>
        <label>
          <input
            type="radio"
            value="終日"
            checked={category === "終日"}
            onChange={(e) => setCategory(e.target.value)}
          />
          終日
        </label>
        <label>
          <input
            type="radio"
            value="昼"
            checked={category === "昼"}
            onChange={(e) => setCategory(e.target.value)}
          />
          昼
        </label>
        <label>
          <input
            type="radio"
            value="夜"
            checked={category === "夜"}
            onChange={(e) => setCategory(e.target.value)}
          />
          夜
        </label>
      </div>

      {/* 時間プルダウン */}
      <div style={{ marginTop: "10px" }}>
        <label>開始: </label>
        <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
          {timeOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <label>終了: </label>
        <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
          {timeOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* 保存ボタン */}
      <button onClick={handleSave} style={{ marginTop: "10px" }}>追加</button>

      {/* 選択済み日付 */}
      <div style={{ marginTop: "10px" }}>
        <strong>選択日: </strong>{selectedDates.join(", ")}
      </div>

      {/* 簡易カレンダー（1か月表示） */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px", marginTop: "20px" }}>
        {Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(i + 1);
          const dateStr = date.toISOString().split("T")[0];
          return (
            <div
              key={dateStr}
              onClick={() => handleDateClick(dateStr)}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                cursor: "pointer",
                background: selectedDates.includes(dateStr) ? "#aaf" : "#fff"
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      {/* イベント一覧 */}
      <h3 style={{ marginTop: "20px" }}>登録済みイベント</h3>
      <ul>
        {events.map((ev) => (
          <li key={ev.id}>
            {ev.dates.join(", ")}: {ev.title} ({ev.category}) {ev.startTime}〜{ev.endTime}
          </li>
        ))}
      </ul>
    </div>
  );
}
