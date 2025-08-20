import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeslot, setTimeslot] = useState("全日");
  const [link, setLink] = useState("");

  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      setDates(value);
    } else {
      setDates(value);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        title,
        dates:
          rangeMode === "range"
            ? [dates[0], dates[1]]
            : dates.map((d) => new Date(d).toISOString().split("T")[0]),
        timeslot,
        range_mode: rangeMode,
      };

      const res = await axios.post("/api/schedule", payload);
      setLink(window.location.origin + res.data.link);
    } catch (err) {
      alert("登録に失敗しました");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#FDB9C8]">日程登録</h2>

      <div className="mb-4">
        <label className="block mb-1">タイトル</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
        onChange={handleDateChange}
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
        className="mt-6 bg-[#004CA0] text-white px-6 py-2 rounded-2xl hover:bg-blue-900"
      >
        共有リンクを発行
      </button>

      {link && (
        <div className="mt-4">
          <p>共有リンク:</p>
          <a href={link} className="text-blue-400 underline">
            {link}
          </a>
        </div>
      )}
    </div>
  );
}
