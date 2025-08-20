import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useHolidays } from "../hooks/useHolidays";

export default function PersonalPage() {
  const [dates, setDates] = useState([]);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [timeslot, setTimeslot] = useState("全日");
  const [rangeMode, setRangeMode] = useState("multiple");
  const holidays = useHolidays();

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

      <Calendar
        onClickDay={toggleDate}
        tileClassName={({ date }) => {
          const iso = date.toISOString().split("T")[0];
          if (dates.includes(iso)) {
            return "bg-blue-600 text-white rounded-full";
          }
          if (holidays.includes(iso)) {
            return "text-red-500 font-bold";
          }
          return "";
        }}
        locale="ja-JP"
      />

      <button
        onClick={handleSubmit}
        className="mt-6 w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-500"
      >
        登録する
      </button>
    </div>
  );
}
