import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeslot, setTimeslot] = useState("終日");
  const [saved, setSaved] = useState([]);

  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      setDates(value);
    } else {
      setDates(Array.isArray(value) ? value : [value]);
    }
  };

  const handleSubmit = async () => {
    const formattedDates = Array.isArray(dates)
      ? dates.map((d) => d.toISOString().split("T")[0])
      : [dates.toISOString().split("T")[0]];
    await axios.post("/api/personal", {
      title,
      memo,
      dates: formattedDates,
      timeslot,
      range_mode: rangeMode,
    });
    setSaved([...saved, { title, memo, dates: formattedDates, timeslot }]);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#004CA0]">個人スケジュール</h2>
      <input
        type="text"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />
      <textarea
        placeholder="メモ"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            checked={rangeMode === "multiple"}
            onChange={() => setRangeMode("multiple")}
          />
          複数選択
        </label>
        <label>
          <input
            type="radio"
            checked={rangeMode === "range"}
            onChange={() => setRangeMode("range")}
          />
          範囲選択
        </label>
      </div>
      <Calendar
        onChange={handleDateChange}
        value={dates}
        selectRange={rangeMode === "range"}
        tileClassName="hover:bg-[#FDB9C8]"
      />
      <div className="mt-4">
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option>終日</option>
          <option>昼</option>
          <option>夜</option>
          <option>1時から0時</option>
        </select>
      </div>
      <button
        onClick={handleSubmit}
        className="bg-[#004CA0] text-white px-6 py-2 mt-6 rounded shadow hover:scale-105"
      >
        登録
      </button>
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">登録済み一覧</h3>
        <ul>
          {saved.map((s, i) => (
            <li key={i} className="border-b py-2">
              {s.title} ({s.timeslot}) - {s.dates.join(", ")} <br />
              <span className="text-sm text-gray-600">{s.memo}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
