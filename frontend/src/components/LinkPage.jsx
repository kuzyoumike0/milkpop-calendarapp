import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import Holidays from "date-holidays";

const hd = new Holidays("JP"); // 🇯🇵 日本の祝日

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple"); // デフォルト: 複数選択
  const [timeslot, setTimeslot] = useState("全日");
  const [shareUrl, setShareUrl] = useState("");

  // === スケジュール登録 & 共有リンク生成 ===
  const handleSubmit = async () => {
    if (!title || dates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }
    try {
      const res = await axios.post("/api/schedules", {
        title,
        dates,
        timeslot,
        rangeMode,
      });
      setTitle("");
      setDates([]);
      setTimeslot("全日");
      setShareUrl(`${window.location.origin}/share/${res.data.linkId}`);
    } catch (err) {
      console.error("登録失敗:", err);
      alert("保存に失敗しました");
    }
  };

  // === Calendar tileClassName (祝日 + 選択日強調) ===
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      if (hd.isHoliday(date)) {
        return "holiday"; // 祝日は赤
      }
      if (dates.some((d) => new Date(d).toDateString() === date.toDateString())) {
        return "selected-day"; // 選択日は色付き
      }
    }
    return null;
  };

  // === Calendar onChange ===
  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      if (Array.isArray(value) && value.length === 2) {
        const [start, end] = value;
        const rangeDates = [];
        let current = new Date(start);
        while (current <= end) {
          rangeDates.push(current.toISOString().split("T")[0]);
          current.setDate(current.getDate() + 1);
        }
        setDates(rangeDates);
      }
    } else {
      // 複数選択
      if (Array.isArray(value)) {
        setDates(value.map((d) => d.toISOString().split("T")[0]));
      } else {
        setDates([value.toISOString().split("T")[0]]);
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-[#004CA0]">
        日程登録ページ
      </h2>

      <input
        className="border p-2 mb-2 w-full rounded"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

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
        onChange={handleDateChange}
        selectRange={rangeMode === "range"}
        value={
          dates.length > 0
            ? rangeMode === "range"
              ? [new Date(dates[0]), new Date(dates[dates.length - 1])]
              : dates.map((d) => new Date(d))
            : null
        }
        tileClassName={tileClassName}
      />

      <div className="mt-4">
        <label className="mr-2">時間帯:</label>
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          className="border p-1 rounded"
        >
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          {Array.from({ length: 24 }).map((_, i) => (
            <option key={i} value={`${i}:00 - ${(i + 1) % 24}:00`}>
              {i}:00 - {(i + 1) % 24}:00
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-[#FDB9C8] text-black rounded-lg shadow hover:bg-[#e0a5b4]"
      >
        登録 & リンク発行
      </button>

      {shareUrl && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow">
          <p className="mb-2 text-[#004CA0] font-semibold">共有リンク:</p>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
}
