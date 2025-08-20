import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [savedSchedules, setSavedSchedules] = useState([]);

  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      setDates(value);
    } else {
      setDates(Array.isArray(value) ? value : [value]);
    }
  };

  const handleSave = async () => {
    try {
      const res = await axios.post("/api/personal", {
        title,
        memo,
        dates,
        timeslot: timeSlot,
        range_mode: rangeMode,
      });
      setSavedSchedules([...savedSchedules, res.data]);
      setTitle("");
      setMemo("");
      setDates([]);
    } catch (err) {
      console.error("保存失敗:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* バナー */}
      <header className="bg-[#004CA0] text-white text-center py-4 text-2xl font-bold">
        MilkPOP Calendar
      </header>

      <main className="flex flex-col items-center flex-grow py-10 px-4">
        <h2 className="text-2xl font-bold mb-6">個人スケジュール登録</h2>

        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 p-2 rounded text-black w-80"
        />

        <textarea
          placeholder="メモを入力"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="mb-4 p-2 rounded text-black w-80 h-24"
        />

        <div className="mb-6">
          <Calendar
            onChange={handleDateChange}
            value={dates}
            selectRange={rangeMode === "range"}
            locale="ja-JP"
          />
        </div>

        <div className="flex gap-6 mb-6">
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

        <select
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
          className="mb-6 p-2 rounded text-black"
        >
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="時間指定">時間指定 (1時〜0時)</option>
        </select>

        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[#FDB9C8] text-black rounded-lg font-bold hover:bg-[#004CA0] hover:text-white transition"
        >
          保存
        </button>

        <div className="mt-8 w-full max-w-2xl">
          <h3 className="text-xl font-bold mb-4">登録済みスケジュール</h3>
          <ul className="space-y-3">
            {savedSchedules.map((s, idx) => (
              <li
                key={idx}
                className="p-4 bg-[#004CA0]/50 rounded-lg shadow-md"
              >
                <p className="font-bold">{s.title}</p>
                <p className="text-sm text-gray-300">{s.memo}</p>
                <p className="text-sm mt-1">{s.timeslot}</p>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
