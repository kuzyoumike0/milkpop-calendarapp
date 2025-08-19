import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [multiDates, setMultiDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("範囲選択");
  const [timeslot, setTimeslot] = useState("終日");
  const [shareUrl, setShareUrl] = useState("");

  const handleDateChange = (value) => {
    if (rangeMode === "範囲選択") {
      setDateRange(value);
    } else {
      const dateStr = value.toISOString().slice(0, 10);
      if (multiDates.find(d => d.toISOString().slice(0, 10) === dateStr)) {
        setMultiDates(multiDates.filter(d => d.toISOString().slice(0, 10) !== dateStr));
      } else {
        setMultiDates([...multiDates, value]);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      let start_date, end_date, dates = [];

      if (rangeMode === "範囲選択" && Array.isArray(dateRange)) {
        start_date = dateRange[0];
        end_date = dateRange[1];
      } else if (rangeMode === "範囲選択") {
        start_date = dateRange;
        end_date = dateRange;
      } else {
        const sorted = [...multiDates].sort((a, b) => a - b);
        start_date = sorted[0];
        end_date = sorted[sorted.length - 1];
        dates = sorted;
      }

      const res = await axios.post("/api/schedule", {
        title,
        start_date: start_date?.toISOString().slice(0, 10),
        end_date: end_date?.toISOString().slice(0, 10),
        timeslot,
        range_mode: rangeMode,
        dates: dates.map(d => d.toISOString().slice(0, 10)),
      });

      setShareUrl(window.location.origin + res.data.url);
    } catch (err) {
      console.error(err);
      alert("登録エラー");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-gradient-to-b from-[#111] to-black p-8 rounded-2xl shadow-2xl space-y-6">
      <h2 className="text-3xl font-extrabold text-center text-[#FDB9C8]">日程登録</h2>

      <input
        className="w-full p-3 text-black rounded-xl shadow focus:ring-2 focus:ring-[#FDB9C8]"
        placeholder="タイトルを入力"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <div className="bg-white p-4 rounded-xl shadow-lg">
        <Calendar
          onClickDay={handleDateChange}
          value={rangeMode === "範囲選択" ? dateRange : null}
          selectRange={rangeMode === "範囲選択"}
          tileClassName={({ date }) => {
            if (rangeMode === "複数選択" &&
              multiDates.find(d => d.toDateString() === date.toDateString())) {
              return "bg-[#FDB9C8] text-black rounded-full";
            }
            return "";
          }}
        />
      </div>

      <div className="flex space-x-6 justify-center">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={rangeMode === "範囲選択"}
            onChange={() => { setRangeMode("範囲選択"); setMultiDates([]); }}
          />
          <span>範囲選択</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={rangeMode === "複数選択"}
            onChange={() => { setRangeMode("複数選択"); setDateRange(null); }}
          />
          <span>複数選択</span>
        </label>
      </div>

      <select
        value={timeslot}
        onChange={e => setTimeslot(e.target.value)}
        className="w-full p-3 text-black rounded-xl shadow focus:ring-2 focus:ring-[#004CA0]"
      >
        <option>終日</option>
        <option>昼</option>
        <option>夜</option>
        <option>1時から0時</option>
      </select>

      <button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-[#004CA0] to-[#FDB9C8] hover:scale-105 transform transition font-bold text-white py-3 rounded-2xl shadow-lg"
      >
        共有リンク発行
      </button>

      {shareUrl && (
        <div className="bg-[#222] p-4 rounded-xl shadow text-center">
          <p className="text-gray-300 mb-2">共有URL:</p>
          <a href={shareUrl} className="text-[#FDB9C8] font-mono break-all hover:underline">
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
}
