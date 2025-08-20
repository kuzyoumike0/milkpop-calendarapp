import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-multi-date-picker";
import "react-multi-date-picker/styles/colors/purple.css";

export default function SharePage() {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("range");
  const [dates, setDates] = useState([]);
  const [timeslot, setTimeslot] = useState("全日");
  const [link, setLink] = useState("");
  const [schedules, setSchedules] = useState([]);

  const fetchSchedules = async () => {
    const res = await axios.get("/api/schedules"); // API拡張要
    setSchedules(res.data);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSubmit = async () => {
    if (!title || dates.length === 0) return alert("入力不足です");
    let start_date, end_date;
    if (mode === "range") {
      start_date = dates[0]?.format("YYYY-MM-DD");
      end_date = dates[1]?.format("YYYY-MM-DD");
    } else {
      start_date = dates[0]?.format("YYYY-MM-DD");
      end_date = dates[dates.length - 1]?.format("YYYY-MM-DD");
    }
    const res = await axios.post("/api/schedule", {
      title,
      start_date,
      end_date,
      timeslot,
      range_mode: mode,
    });
    setLink(res.data.link);
    fetchSchedules();
  };

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-2xl mb-4">共有スケジュール登録</h1>
      <input
        className="p-2 text-black rounded mb-2 w-full"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="mb-2">
        <label>
          <input
            type="radio"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          範囲選択
        </label>
        <label className="ml-4">
          <input
            type="radio"
            checked={mode === "multiple"}
            onChange={() => setMode("multiple")}
          />
          複数選択
        </label>
      </div>
      <DatePicker
        value={dates}
        onChange={setDates}
        range={mode === "range"}
        multiple={mode === "multiple"}
        format="YYYY-MM-DD"
      />
      <select
        className="p-2 text-black rounded mb-4 block"
        value={timeslot}
        onChange={(e) => setTimeslot(e.target.value)}
      >
        <option>全日</option>
        <option>昼</option>
        <option>夜</option>
        <option>時間指定</option>
      </select>
      <button
        className="bg-blue-600 px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        登録
      </button>

      {link && (
        <div className="mt-4">
          <p>共有リンク: <a href={link} className="text-pink-400">{link}</a></p>
        </div>
      )}

      <h2 className="mt-6 text-xl">登録済みスケジュール</h2>
      <ul>
        {schedules.map((s) => (
          <li key={s.id}>
            {s.title} : {s.start_date} - {s.end_date} [{s.timeslot}]
          </li>
        ))}
      </ul>
    </div>
  );
}
