import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import "./CalendarCustom.css";

export default function SharePage() {
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({});
  const [rangeMode, setRangeMode] = useState("multiple");
  const [selectedDates, setSelectedDates] = useState([]);

  // === スケジュール取得 ===
  const fetchSchedules = async () => {
    const res = await axios.get("/api/schedules");
    const sorted = res.data.sort((a, b) => a.dates[0].localeCompare(b.dates[0]));
    setSchedules(sorted);
  };
  useEffect(() => {
    fetchSchedules();
  }, []);

  // === カレンダー選択 ===
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
          setSelectedDates(datesInRange);
        }
      }
    } else {
      setSelectedDates(Array.isArray(value) ? value : [value]);
    }
  };

  // === 保存 ===
  const handleSave = async () => {
    if (!username) return alert("名前を入力してください");

    await axios.post("/api/responses", {
      username,
      responses,
    });

    alert("保存しました");
    fetchSchedules();
  };

  // === プルダウン変更 ===
  const handleSelectChange = (scheduleId, value) => {
    setResponses((prev) => ({
      ...prev,
      [scheduleId]: value,
    }));
  };

  return (
    <div className="page">
      <h2 className="banner">共有スケジュール</h2>

      <div className="form-section">
        <input
          type="text"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          value={selectedDates}
          locale="ja-JP"
        />
      </div>

      <div className="list">
        <h3>日程一覧</h3>
        <table className="table">
          <thead>
            <tr>
              <th>タイトル</th>
              <th>日付</th>
              <th>時間帯</th>
              <th>選択</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td>{s.dates.join(", ")}</td>
                <td>{s.timeslot}</td>
                <td>
                  <select
                    value={responses[s.id] || ""}
                    onChange={(e) => handleSelectChange(s.id, e.target.value)}
                  >
                    <option value="">未選択</option>
                    <option value="〇">〇</option>
                    <option value="✖">✖</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="button" onClick={handleSave}>
        保存
      </button>
    </div>
  );
}
