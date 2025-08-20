import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import ShareButton from "./ShareButton";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [link, setLink] = useState("");

  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      setDates(value);
    } else {
      setDates(Array.isArray(value) ? value : [value]);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/api/schedules", {
        title,
        dates,
        timeslot: timeSlot,
        range_mode: rangeMode,
      });
      setLink(res.data.link);
    } catch (err) {
      console.error("リンク作成失敗:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* バナー */}
      <header className="bg-[#004CA0] text-white text-center py-4 text-2xl font-bold">
        MilkPOP Calendar
      </header>

      <main className="flex flex-col items-center flex-grow py-10 px-4">
        <h2 className="text-2xl font-bold mb-6">📅 日程登録</h2>

        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 p-2 rounded text-black w-80"
        />

        {/* 日付選択 */}
        <div className="mb-6">
          <Calendar
            onChange={handleDateChange}
            value={dates}
            selectRange={rangeMode === "range"}
            locale="ja-JP"
          />
        </div>

        {/* モード切替 */}
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

        {/* 時間帯選択 */}
        <select
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
          className="mb-6 p-2 rounded text-black"
        >
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>

        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-[#FDB9C8] text-black rounded-lg font-bold hover:bg-[#004CA0] hover:text-white transition"
        >
          🔗 共有リンクを発行
        </button>

        {link && (
          <div className="mt-6 p-4 bg-[#004CA0]/50 rounded-lg">
            <p>発行されたリンク:</p>
            <ShareButton link={link} />
          </div>
        )}
      </main>
    </div>
  );
}
