import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import "./CalendarCustom.css"; // index.css に統合してもOK

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [timeslot, setTimeslot] = useState("全日");
  const [rangeMode, setRangeMode] = useState("multiple"); // "multiple" or "range"
  const [dates, setDates] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // === DBから即時反映 ===
  const fetchSchedules = async () => {
    const res = await axios.get("/api/schedules");
    setSchedules(res.data);
  };
  useEffect(() => {
    fetchSchedules();
  }, []);

  // === カレンダー選択ハンドラ ===
  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      if (Array.isArray(value)) {
        const [start, end] = value;
        if (start && end) {
          const datesInRange = [];
          let current = new Date(start);
          while (current <= end) {
            datesInRange.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
          setDates(datesInRange);
        } else {
          setDates([]);
        }
      }
    } else {
      setDates(Array.isArray(value) ? value : [value]);
    }
  };

  // === スケジュール登録 ===
  const handleSubmit = async () => {
    if (!title || dates.length === 0) return alert("タイトルと日程を入力してください");

    await axios.post("/api/schedules", {
      title,
      memo,
      dates: dates.map((d) => d.toISOString().split("T")[0]),
      timeslot,
    });

    setTitle("");
    setMemo("");
    setDates([]);
    fetchSchedules();
  };

  return (
    <div className="page">
      <h2 className="banner">個人日程登録</h2>

      <div className="form-section">
        <input
          type="text"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
        <textarea
          placeholder="メモ"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="input"
        />

        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            複数日選択
          </label>
          <label>
            <input
              type="radio"
              value="range"
              checked={rangeMode === "range"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            範囲選択
          </label>
        </div>

        <Calendar
          selectRange={rangeMode === "range"}
          onChange={handleDateChange}
          value={dates}
          locale="ja-JP"
        />

        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="全日"
              checked={timeslot === "全日"}
              onChange={(e) => setTimeslot(e.target.value)}
            />
            全日
          </label>
          <label>
            <input
              type="radio"
              value="昼"
              checked={timeslot === "昼"}
              onChange={(e) => setTimeslot(e.target.value)}
            />
            昼
          </label>
          <label>
            <input
              type="radio"
              value="夜"
              checked={timeslot === "夜"}
              onChange={(e) => setTimeslot(e.target.value)}
            />
            夜
          </label>
        </div>

        <button className="button" onClick={handleSubmit}>
          登録
        </button>
      </div>

      <div className="list">
        <h3>登録済み日程</h3>
        <ul>
          {schedules.map((s, i) => (
            <li key={i}>
              {s.title} ({s.timeslot}) {s.dates.join(", ")}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
