import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dateRange, setDateRange] = useState(new Date());
  const [rangeMode, setRangeMode] = useState("範囲選択");
  const [timeslot, setTimeslot] = useState("終日");
  const [shareUrl, setShareUrl] = useState("");

  // カレンダーの日付選択（範囲選択か複数選択かで動作変更）
  const handleDateChange = (value) => {
    setDateRange(value);
  };

  const handleSubmit = async () => {
    let start_date, end_date;
    if (Array.isArray(dateRange)) {
      start_date = dateRange[0];
      end_date = dateRange[1];
    } else {
      start_date = dateRange;
      end_date = dateRange;
    }

    const res = await axios.post("/api/schedule", {
      title,
      start_date: start_date.toISOString().slice(0, 10),
      end_date: end_date.toISOString().slice(0, 10),
      timeslot,
      range_mode: rangeMode,
    });
    setShareUrl(window.location.origin + res.data.url);
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#111] p-6 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-[#FDB9C8]">日程登録</h2>

      <input
        className="w-full p-2 text-black rounded"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* カレンダー */}
      <div className="bg-white p-4 rounded-xl shadow">
        <Calendar
          onChange={handleDateChange}
          value={dateRange}
          selectRange={rangeMode === "範囲選択"}
        />
      </div>

      {/* 範囲 or 複数選択 */}
      <div className="flex space-x-4">
        <label>
          <input
            type="radio"
            checked={rangeMode === "範囲選択"}
            onChange={() => setRangeMode("範囲選択")}
          />{" "}
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            checked={rangeMode === "複数選択"}
            onChange={() => setRangeMode("複数選択")}
          />{" "}
          複数選択
        </label>
      </div>

      {/* 時間帯プルダウン */}
      <select
        value={timeslot}
        onChange={(e) => setTimeslot(e.target.value)}
        className="w-full p-2 text-black rounded"
      >
        <option>終日</option>
        <option>昼</option>
        <option>夜</option>
        <option>1時から0時</option>
      </select>

      {/* 保存ボタン */}
      <button
        onClick={handleSubmit}
        className="w-full bg-[#004CA0] hover:bg-[#FDB9C8] text-white font-bold py-2 px-4 rounded-xl transition"
      >
        共有リンク発行
      </button>

      {/* 共有URL */}
      {shareUrl && (
        <div className="bg-[#222] p-4 rounded-xl text-center">
          <p className="text-sm">共有URL:</p>
          <a href={shareUrl} className="text-[#FDB9C8] break-all">{shareUrl}</a>
        </div>
      )}
    </div>
  );
}
