import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [rangeMode, setRangeMode] = useState("範囲選択");
  const [timeslot, setTimeslot] = useState("終日");
  const [shareUrl, setShareUrl] = useState("");

  // === 日付選択 ===
  const handleDateChange = (value) => {
    if (rangeMode === "範囲選択") {
      setDateRange(value); // value = [start, end]
    } else {
      // 複数選択
      const dateStr = value.toISOString().slice(0, 10);
      if (dateRange.find((d) => d.toISOString().slice(0, 10) === dateStr)) {
        // すでに選択済 → 解除
        setDateRange(dateRange.filter((d) => d.toISOString().slice(0, 10) !== dateStr));
      } else {
        setDateRange([...dateRange, value]);
      }
    }
  };

  // === 登録処理 ===
  const handleSubmit = async () => {
    try {
      let start_date, end_date;

      if (rangeMode === "範囲選択") {
        if (Array.isArray(dateRange)) {
          start_date = dateRange[0];
          end_date = dateRange[1];
        } else {
          start_date = dateRange;
          end_date = dateRange;
        }
      } else {
        // 複数選択 → 最小日付と最大日付を範囲として保存
        const sorted = [...dateRange].sort((a, b) => a - b);
        start_date = sorted[0];
        end_date = sorted[sorted.length - 1];
      }

      if (!title || !start_date || !end_date) {
        alert("タイトルと日付を入力してください");
        return;
      }

      const res = await axios.post("/api/schedule", {
        title,
        start_date: start_date.toISOString().slice(0, 10),
        end_date: end_date.toISOString().slice(0, 10),
        timeslot,
        range_mode: rangeMode,
      });

      if (res.data && res.data.url) {
        setShareUrl(window.location.origin + res.data.url);
      } else {
        alert("リンク発行に失敗しました");
      }
    } catch (err) {
      console.error(err);
      alert("サーバーエラーが発生しました");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-gradient-to-b from-[#111] to-black p-8 rounded-2xl shadow-2xl space-y-6">
      <h2 className="text-3xl font-extrabold text-center text-[#FDB9C8]">
        日程登録
      </h2>

      {/* タイトル入力 */}
      <input
        className="w-full p-3 text-black rounded-xl shadow focus:ring-2 focus:ring-[#FDB9C8]"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* カレンダー */}
      <div className="bg-white p-4 rounded-xl shadow-lg">
        <Calendar
          onClickDay={rangeMode === "複数選択" ? handleDateChange : undefined}
          onChange={rangeMode === "範囲選択" ? handleDateChange : undefined}
          value={dateRange}
          selectRange={rangeMode === "範囲選択"}
          tileClassName={({ date }) => {
            if (
              rangeMode === "複数選択" &&
              dateRange.find((d) => d.toDateString() === date.toDateString())
            ) {
              return "bg-[#FDB9C8] text-black rounded-full";
            }
            return "";
          }}
        />
      </div>

      {/* モード切替 */}
      <div className="flex space-x-6 justify-center">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={rangeMode === "範囲選択"}
            onChange={() => {
              setRangeMode("範囲選択");
              setDateRange([]);
            }}
          />
          <span>範囲選択</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={rangeMode === "複数選択"}
            onChange={() => {
              setRangeMode("複数選択");
              setDateRange([]);
            }}
          />
          <span>複数選択</span>
        </label>
      </div>

      {/* 時間帯選択 */}
      <select
        value={timeslot}
        onChange={(e) => setTimeslot(e.target.value)}
        className="w-full p-3 text-black rounded-xl shadow focus:ring-2 focus:ring-[#004CA0]"
      >
        <option>終日</option>
        <option>昼</option>
        <option>夜</option>
        <option>1時から0時</option>
      </select>

      {/* 登録ボタン */}
      <button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-[#004CA0] to-[#FDB9C8] hover:scale-105 transform transition font-bold text-white py-3 rounded-2xl shadow-lg"
      >
        共有リンク発行
      </button>

      {/* 共有URL */}
      {shareUrl && (
        <div className="bg-[#222] p-4 rounded-xl shadow text-center">
          <p className="text-gray-300 mb-2">共有URL:</p>
          <a
            href={shareUrl}
            className="text-[#FDB9C8] font-mono break-all hover:underline"
          >
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
}
