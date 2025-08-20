import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("range"); // "range" or "multi"
  const [timeSlot, setTimeSlot] = useState("終日");
  const [shareUrl, setShareUrl] = useState("");

  const handleDateChange = (selected) => {
    if (rangeMode === "range") {
      setDates(
        Array.isArray(selected)
          ? [selected[0], selected[1]]
          : [selected]
      );
    } else {
      setDates(Array.isArray(selected) ? selected : [selected]);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/api/share", {
        title,
        dates,
        timeslot: timeSlot,
        range_mode: rangeMode,
      });
      setShareUrl(window.location.origin + res.data.url);
    } catch (err) {
      alert("共有リンク作成失敗");
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">日程登録ページ</h2>

      <input
        className="border p-2 mb-3 w-full"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            value="range"
            checked={rangeMode === "range"}
            onChange={(e) => setRangeMode(e.target.value)}
          />
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            value="multi"
            checked={rangeMode === "multi"}
            onChange={(e) => setRangeMode(e.target.value)}
          />
          複数選択
        </label>
      </div>

      <Calendar
        selectRange={rangeMode === "range"}
        onChange={handleDateChange}
        value={dates}
        locale="ja-JP"
      />

      <div className="mt-4">
        <select
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
          className="border p-2"
        >
          <option value="終日">終日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="時間指定">時間指定（開始〜終了）</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-pink-400 text-white rounded"
      >
        共有リンク作成
      </button>

      {shareUrl && (
        <div className="mt-4">
          <p>共有リンクが作成されました:</p>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
}
