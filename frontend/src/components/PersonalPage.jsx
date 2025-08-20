import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [dates, setDates] = useState([]);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [timeslot, setTimeslot] = useState("全日");
  const [rangeMode, setRangeMode] = useState("multiple");

  const toggleDate = (date) => {
    const iso = date.toISOString().split("T")[0];
    if (dates.includes(iso)) {
      setDates(dates.filter((d) => d !== iso));
    } else {
      setDates([...dates, iso]);
    }
  };

  const handleSubmit = async () => {
    await axios.post("/api/personal", { title, memo, dates, timeslot, range_mode: rangeMode });
    alert("登録しました！");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">個人スケジュール登録</h1>

      <input
        className="w-full p-2 mb-3 bg-gray-800 rounded"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full p-2 mb-3 bg-gray-800 rounded"
        placeholder="メモ"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
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
        tileClassName={({ date }) =>
          dates.includes(date.toISOString().split("T")[0]) ? "bg-blue-600 text-white rounded-full" : ""
        }
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
        className="mt-6 w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-500"
      >
        登録する
      </button>
    </div>
  );
}
