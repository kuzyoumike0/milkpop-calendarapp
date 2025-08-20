import React, { useState } from "react";
import Calendar from "react-multi-date-picker";
import "react-multi-date-picker/styles/colors/purple.css";
import axios from "axios";
import Holidays from "date-holidays";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeslot, setTimeslot] = useState("全日");
  const [shareUrl, setShareUrl] = useState("");

  const hd = new Holidays("JP");

  const handleSubmit = async () => {
    if (!title || dates.length === 0) {
      alert("タイトルと日付を入力してください");
      return;
    }

    try {
      const start_date = dates[0].format("YYYY-MM-DD");
      const end_date = dates[dates.length - 1].format("YYYY-MM-DD");

      const res = await axios.post("/api/schedule", {
        title,
        start_date,
        end_date,
        timeslot,
        range_mode: rangeMode,
      });

      setShareUrl(window.location.origin + res.data.link);
    } catch (err) {
      console.error("日程登録エラー:", err);
    }
  };

  // 祝日赤字
  const highlightHoliday = ({ date }) => {
    const d = new Date(date.year, date.month - 1, date.day);
    if (hd.isHoliday(d)) {
      return {
        style: {
          color: "red",
          fontWeight: "bold",
        },
      };
    }
    return {};
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="text-center text-3xl font-bold mb-6 text-[#FDB9C8]">
        MilkPOP Calendar - 日程登録
      </header>

      <div className="bg-[#004CA0] rounded-2xl p-6 shadow-lg">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
        />

        {/* ラジオボタン切替 */}
        <div className="mb-4">
          <label className="mr-4">
            <input
              type="radio"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={() => setRangeMode("multiple")}
            />
            複数選択
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

        <Calendar
          multiple={rangeMode === "multiple"}
          range={rangeMode === "range"}
          value={dates}
          onChange={setDates}
          mapDays={highlightHoliday}
          className="purple"
        />

        {/* 時間帯 */}
        <div className="mt-4">
          <select
            value={timeslot}
            onChange={(e) => setTimeslot(e.target.value)}
            className="p-2 rounded text-black"
          >
            <option value="全日">全日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={`${i}:00`}>
                {i}:00
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 bg-[#FDB9C8] text-black px-4 py-2 rounded-xl font-bold"
        >
          共有リンク発行
        </button>

        {shareUrl && (
          <div className="mt-4">
            <p>共有リンク:</p>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#FDB9C8] underline"
            >
              {shareUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
