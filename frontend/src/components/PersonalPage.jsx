import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeslot, setTimeslot] = useState("全日");

  const handleSubmit = async () => {
    try {
      const payload = {
        title,
        memo,
        dates:
          rangeMode === "range"
            ? [dates[0], dates[1]]
            : dates.map((d) => new Date(d).toISOString().split("T")[0]),
        timeslot,
        range_mode: rangeMode,
      };
      await axios.post("/api/personal", payload);
      alert("保存しました！");
    } catch (err) {
      alert("登録に失敗しました");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#FDB9C8]">個人スケジュール登録</h2>

      <div className="mb-4">
        <label className="block mb-1">タイトル</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">メモ</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">選択モード</label>
        <div className="space-x-4">
          <label>
            <input
              type="radio"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={() => setRangeMode("multiple")}
            />
            複数日選択
          </label>
          <label>
            <input
              type="radio"
              value="range"
              checked={rangeMode === "range"}
              onChange={() => setRangeMode("range")}
            />
            範囲選択
          </label>
        </div>
      </div>

      <Calendar
        onChange={setDates}
        selectRange={rangeMode === "range"}
        value={dates}
        locale="ja-JP"
      />

      <div className="mt-4">
        <label className="block mb-2">時間帯</label>
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white"
        >
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
          <option>1時から0時</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-[#FDB9C8] text-black px-6 py-2 rounded-2xl hover:bg-pink-400"
      >
        保存
      </button>
    </div>
  );
}
