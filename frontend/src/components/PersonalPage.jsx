import React, { useState } from "react";
import Calendar from "react-multi-date-picker";
import "react-multi-date-picker/styles/colors/purple.css";
import axios from "axios";
import Holidays from "date-holidays";

export default function PersonalPage() {
  const [username, setUsername] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeslot, setTimeslot] = useState("全日");

  const hd = new Holidays("JP"); // 日本の祝日

  const handleSubmit = async () => {
    if (!username || dates.length === 0) {
      alert("名前と日付を入力してください");
      return;
    }

    try {
      for (let d of dates) {
        const start_date = d.format("YYYY-MM-DD");
        const end_date = d.format("YYYY-MM-DD");
        await axios.post("/api/personal", {
          username,
          start_date,
          end_date,
          timeslot,
          range_mode: rangeMode,
        });
      }
      alert("登録しました ✅");
    } catch (err) {
      console.error("個人スケジュール登録エラー:", err);
    }
  };

  // 祝日スタイルを付与する関数
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
        MilkPOP Calendar - 個人スケジュール
      </header>

      <div className="bg-[#004CA0] rounded-2xl p-6 shadow-lg">
        <input
          type="text"
          placeholder="名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
        />

        {/* ラジオボタンで範囲選択 or 複数選択 */}
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

        {/* 時間帯選択 */}
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
          登録
        </button>
      </div>
    </div>
  );
}
