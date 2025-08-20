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

  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      setDates(value);
    } else {
      setDates(value);
    }
  };

  const handleSubmit = async () => {
    try {
      let formattedDates = [];
      if (rangeMode === "range" && dates.length === 2) {
        const start = new Date(dates[0]);
        const end = new Date(dates[1]);
        const temp = [];
        while (start <= end) {
          temp.push(new Date(start).toISOString().split("T")[0]);
          start.setDate(start.getDate() + 1);
        }
        formattedDates = temp;
      } else if (rangeMode === "multiple") {
        formattedDates = dates.map((d) =>
          new Date(d).toISOString().split("T")[0]
        );
      }

      const payload = {
        title,
        memo,
        dates: formattedDates,
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
      <h2 className="text-2xl font-bold mb-4 text-[#FDB9C8]">
        個人スケジュール登録
      </h2>

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
        <div className="space-x-6 flex">
          <label
            className={`px-3 py-1 rounded-2xl cursor-pointer ${
              rangeMode === "multiple"
                ? "bg-pink-500 text-black"
                : "bg-gray-700"
            }`}
          >
            <input
              type="radio"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={() => setRangeMode("multiple")}
              className="hidden"
            />
            複数日選択
          </label>
          <label
            className={`px-3 py-1 rounded-2xl cursor-pointer ${
              rangeMode === "range" ? "bg-blue-500 text-white" : "bg-gray-700"
            }`}
          >
            <input
              type="radio"
              value="range"
              checked={rangeMode === "range"}
              onChange={() => setRangeMode("range")}
              className="hidden"
            />
            範囲選択
          </label>
        </div>
      </div>

      <Calendar
        onChange={handleDateChange}
        selectRange={rangeMode === "range"}
        value={dates}
        locale="ja-JP"
      />

      {/* 選択済み日付をタグ表示 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {rangeMode === "multiple" &&
          dates.map((d, i) => (
            <span
              key={i}
              className="bg-[#FDB9C8] text-black px-3 py-1 rounded-full"
            >
              {new Date(d).toLocaleDateString("ja-JP")}
            </span>
          ))}
        {rangeMode === "range" && dates.length === 2 && (
          <span className="bg-[#004CA0] text-white px-3 py-1 rounded-full">
            {new Date(dates[0]).toLocaleDateString("ja-JP")} 〜{" "}
            {new Date(dates[1]).toLocaleDateString("ja-JP")}
          </span>
        )}
      </div>

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
