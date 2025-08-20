import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import Holidays from "date-holidays";

const hd = new Holidays("JP");

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeslot, setTimeslot] = useState("全日");
  const [rangeMode, setRangeMode] = useState("複数");
  const [rangeStart, setRangeStart] = useState(null);
  const [schedules, setSchedules] = useState([]);

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (rangeMode === "複数") {
      setSelectedDates((prev) =>
        prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
      );
    } else if (rangeMode === "範囲") {
      if (!rangeStart) {
        setRangeStart(date);
        setSelectedDates([dateStr]);
      } else {
        const start = new Date(Math.min(rangeStart, date));
        const end = new Date(Math.max(rangeStart, date));
        const dates = [];
        let current = new Date(start);
        while (current <= end) {
          dates.push(current.toISOString().split("T")[0]);
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(dates);
        setRangeStart(null);
      }
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];
      if (hd.isHoliday(date)) return "text-red-500 font-bold";
      if (selectedDates.includes(dateStr)) return "bg-blue-500 text-white rounded-full";
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日付を入力してください");
      return;
    }
    try {
      await axios.post("/api/personal", {
        title,
        memo,
        dates: selectedDates,
        timeslot,
        range_mode: rangeMode,
      });
      setSchedules([...schedules, { title, memo, dates: selectedDates, timeslot }]);
      setTitle("");
      setMemo("");
      setSelectedDates([]);
    } catch (err) {
      console.error("Error saving schedule:", err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">個人日程登録</h1>

      <input
        type="text"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded text-black block mb-2"
      />
      <textarea
        placeholder="メモ"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        className="border p-2 rounded text-black block mb-2"
      />

      <Calendar onClickDay={handleDateClick} tileClassName={tileClassName} />

      <div className="mt-4">
        <label className="mr-2">時間帯:</label>
        <select value={timeslot} onChange={(e) => setTimeslot(e.target.value)} className="text-black p-1 rounded">
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>

      <div className="mt-4">
        <label className="mr-2">選択モード:</label>
        <select
          value={rangeMode}
          onChange={(e) => {
            setRangeMode(e.target.value);
            setSelectedDates([]);
            setRangeStart(null);
          }}
          className="text-black p-1 rounded"
        >
          <option value="複数">複数選択</option>
          <option value="範囲">範囲選択</option>
        </select>
      </div>

      <button onClick={handleSubmit} className="mt-4 bg-blue-600 px-4 py-2 rounded">
        保存
      </button>

      <div className="mt-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">登録済みスケジュール</h2>
        <ul className="space-y-2">
          {schedules.map((s, idx) => (
            <li key={idx} className="bg-gray-800 p-3 rounded-lg">
              <strong>{s.title}</strong> ({s.timeslot})<br />
              {Array.isArray(s.dates) ? s.dates.join(", ") : s.date}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
