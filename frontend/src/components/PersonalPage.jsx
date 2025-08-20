import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [holidays, setHolidays] = useState([]);
  const [mySchedules, setMySchedules] = useState([]);

  useEffect(() => {
    axios.get("/api/holidays").then((res) => setHolidays(res.data));
    fetchMySchedules();
  }, []);

  const fetchMySchedules = async () => {
    const res = await axios.get("/api/personal");
    setMySchedules(res.data);
  };

  const tileClassName = ({ date }) => {
    const ymd = date.toISOString().split("T")[0];
    if (holidays.includes(ymd)) return "text-red-500 font-bold";
    return null;
  };

  const handleSubmit = async () => {
    await axios.post("/api/personal", {
      title,
      memo,
      dates,
      range_mode: rangeMode,
      timeslot: timeSlot,
    });
    fetchMySchedules();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#FDB9C8]">個人スケジュール登録</h2>
      <input
        type="text"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 border rounded text-black w-full"
      />
      <textarea
        placeholder="メモを入力"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        className="p-2 border rounded text-black w-full"
      />

      {/* 範囲選択か複数選択 */}
      <div className="flex space-x-4">
        <label>
          <input
            type="radio"
            value="range"
            checked={rangeMode === "range"}
            onChange={() => setRangeMode("range")}
          />
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={rangeMode === "multiple"}
            onChange={() => setRangeMode("multiple")}
          />
          複数選択
        </label>
      </div>

      <Calendar
        onChange={setDates}
        value={dates}
        selectRange={rangeMode === "range"}
        tileClassName={tileClassName}
      />

      <select
        value={timeSlot}
        onChange={(e) => setTimeSlot(e.target.value)}
        className="p-2 border rounded text-black"
      >
        <option value="全日">全日</option>
        <option value="昼">昼</option>
        <option value="夜">夜</option>
      </select>

      <button
        onClick={handleSubmit}
        className="px-6 py-3 bg-[#004CA0] text-white rounded-xl shadow hover:bg-[#FDB9C8] hover:text-black transition"
      >
        登録
      </button>

      <div className="mt-6">
        <h3 className="text-lg font-bold">自分の登録スケジュール</h3>
        <ul className="list-disc list-inside">
          {mySchedules.map((s, i) => (
            <li key={i}>{s.title} ({s.timeslot}) - {s.dates.join(", ")}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
