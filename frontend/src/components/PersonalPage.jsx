import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [timeslot, setTimeslot] = useState("終日");
  const [rangeMode, setRangeMode] = useState("multiple");
  const [schedules, setSchedules] = useState([]);

  // 登録済みを即時反映
  const fetchSchedules = async () => {
    const res = await axios.get("/api/personal");
    setSchedules(res.data);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleChange = (selected) => {
    if (Array.isArray(selected)) {
      // 範囲選択
      const [start, end] = selected;
      const range = [];
      let current = new Date(start);
      while (current <= end) {
        range.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      setDates(range);
      setRangeMode("range");
    } else {
      // 複数日選択
      const exists = dates.find(
        (d) => d.toDateString() === selected.toDateString()
      );
      if (exists) {
        setDates(dates.filter((d) => d.toDateString() !== selected.toDateString()));
      } else {
        setDates([...dates, selected]);
      }
      setRangeMode("multiple");
    }
  };

  const handleSubmit = async () => {
    if (!title || dates.length === 0) return;
    await axios.post("/api/personal", {
      title,
      memo,
      dates: dates.map((d) => d.toISOString().slice(0, 10)),
      timeslot,
      range_mode: rangeMode,
    });
    setTitle("");
    setMemo("");
    setDates([]);
    setTimeslot("終日");
    await fetchSchedules();
  };

  return (
    <div className="page">
      <h2>個人スケジュール登録</h2>
      <input
        type="text"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="メモ"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />
      <Calendar
        onClickDay={handleChange}
        selectRange={true}
        tileClassName={({ date }) =>
          dates.some((d) => d.toDateString() === date.toDateString())
            ? "selected-date"
            : null
        }
      />
      <div className="options">
        <label>
          時間帯:
          <select value={timeslot} onChange={(e) => setTimeslot(e.target.value)}>
            <option value="終日">終日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={`${i}:00`}>
                {i}:00
              </option>
            ))}
          </select>
        </label>
      </div>
      <button onClick={handleSubmit}>登録</button>

      <h3>登録済みスケジュール</h3>
      <ul>
        {schedules.map((s, i) => (
          <li key={i}>
            {s.title} ({s.date}) [{s.timeslot}] - {s.memo}
          </li>
        ))}
      </ul>
    </div>
  );
}
