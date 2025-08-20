import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { holidays } from "../utils/holidays";

export default function LinkPage() {
  const [dates, setDates] = useState([]);
  const [title, setTitle] = useState("");
  const [timeslot, setTimeslot] = useState("全日");
  const [rangeMode, setRangeMode] = useState("multiple");
  const [shareLink, setShareLink] = useState("");

  const toggleDate = (date) => {
    const iso = date.toISOString().split("T")[0];
    if (dates.includes(iso)) {
      setDates(dates.filter((d) => d !== iso));
    } else {
      setDates([...dates, iso]);
    }
  };

  const handleSubmit = async () => {
    const res = await axios.post("/api/schedule", { title, dates, timeslot, range_mode: rangeMode });
    setShareLink(res.data.link);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">日程登録（共有リンク発行）</h1>

      <input
        className="w-full p-2 mb-3 bg-gray-800 rounded"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="mb-3">
        <label className="mr-4">
          <input
            type="radio"
            checked={rangeMode === "multiple"}
            onChange={() => setRangeMode("multiple")}
          />{" "}
          複数選択
        </label>
        <label>
          <input
            type="radio"
            checked={rangeMode === "range"}
            onChange={() => setRangeMode("range")}
          />{" "}
          範囲選択
        </label>
      </div>

      <Calendar
        onClickDay={toggleDate}
        tileClassName={({ date }) => {
          const iso = date.toISOString().split("T")[0];
          if (dates.includes(iso)) {
            return "bg-green-600 text-white rounded-full";
          }
          if (holidays.includes(iso)) {
            return "text-red-500 font-bold";
          }
          return "";
        }}
        locale="ja-JP"
      />

      <select
        className="w-full mt-4 p-2 bg-gray-800 rounded"
        value={timeslot}
        onChange={(e) => setTimeslot(e.target.value)}
      >
        <option value="全日">全日</option>
        <option value="昼">昼</option>
        <option value="夜">夜</option>
      </select>

      <button
        onClick={handleSubmit}
        className="mt-6 w-full py-3 bg-green-600 rounded-lg hover:bg-green-500"
      >
        登録してリンク発行
      </button>

      {shareLink && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <p className="mb-2">共有リンク:</p>
          <a href={shareLink} className="text-blue-400 underline break-all">
            {window.location.origin}{shareLink}
          </a>
        </div>
      )}
    </div>
  );
}
