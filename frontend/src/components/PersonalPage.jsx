import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Header from "./Header";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [timeSlot, setTimeSlot] = useState("全日");
  const [rangeMode, setRangeMode] = useState("multiple");

  const handleSave = () => {
    alert("保存しました");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-10">
        <h2 className="text-3xl font-extrabold mb-6 text-[#FDB9C8]">
          個人スケジュール登録
        </h2>

        <div className="mb-6">
          <label className="block mb-2">タイトル</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-xl text-black"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2">メモ</label>
          <textarea
            className="w-full px-4 py-2 rounded-xl text-black"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2">日程選択</label>
          <Calendar
            selectRange={rangeMode === "range"}
            onChange={(value) => setDates(value)}
            value={dates}
          />
        </div>

        <div className="mb-6 flex gap-4">
          <label>
            <input
              type="radio"
              name="mode"
              value="range"
              checked={rangeMode === "range"}
              onChange={() => setRangeMode("range")}
            />
            範囲選択
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={() => setRangeMode("multiple")}
            />
            複数選択
          </label>
        </div>

        <div className="mb-6">
          <label className="block mb-2">時間帯</label>
          <select
            className="w-full px-4 py-2 rounded-xl text-black"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
          >
            <option value="全日">全日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-3 bg-[#FDB9C8] text-black rounded-2xl font-semibold shadow hover:bg-[#004CA0] hover:text-white transition"
        >
          保存
        </button>
      </main>
    </div>
  );
}
