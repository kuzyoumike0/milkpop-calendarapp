import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [rangeMode, setRangeMode] = useState("range");
  const [dates, setDates] = useState([]); // 選択日
  const [timeSlot, setTimeSlot] = useState("終日");
  const [shareUrl, setShareUrl] = useState("");

  // カレンダー日付クリック
  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      if (Array.isArray(value)) {
        setDates(value);
      }
    } else if (rangeMode === "multiple") {
      const dateStr = value.toDateString();
      if (dates.find((d) => d.toDateString() === dateStr)) {
        setDates(dates.filter((d) => d.toDateString() !== dateStr));
      } else {
        setDates([...dates, value]);
      }
    }
  };

  // 選択判定
  const tileClassName = ({ date }) => {
    if (rangeMode === "multiple") {
      return dates.find((d) => d.toDateString() === date.toDateString())
        ? "bg-[#FDB9C8] text-white rounded-full"
        : "";
    }
    if (rangeMode === "range" && dates.length === 2) {
      const [start, end] = dates;
      if (date >= start && date <= end) {
        return "bg-[#004CA0] text-white rounded-full";
      }
    }
    return "";
  };

  // 登録
  const handleSubmit = async () => {
    if (!title || dates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }

    let start_date, end_date;
    if (rangeMode === "range" && dates.length === 2) {
      start_date = dates[0].toISOString().split("T")[0];
      end_date = dates[1].toISOString().split("T")[0];
    } else if (rangeMode === "multiple") {
      const sorted = [...dates].sort((a, b) => a - b);
      start_date = sorted[0].toISOString().split("T")[0];
      end_date = sorted[sorted.length - 1].toISOString().split("T")[0];
    }

    try {
      const res = await axios.post("/api/schedule", {
        title,
        start_date,
        end_date,
        timeslot: timeSlot,
        range_mode: rangeMode,
      });
      setShareUrl(window.location.origin + res.data.url);
    } catch (err) {
      console.error(err);
      alert("登録に失敗しました");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-[#111] text-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-[#FDB9C8] mb-6">
        日程登録ページ
      </h2>

      {/* タイトル */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-black border border-gray-600 focus:ring-2 focus:ring-[#FDB9C8]"
        />
      </div>

      {/* モード選択 */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">モード選択</label>
        <div className="flex space-x-6">
          <label>
            <input
              type="radio"
              value="range"
              checked={rangeMode === "range"}
              onChange={() => setRangeMode("range")}
            />
            範囲選択
          </label>
          <label>
            <input
              type="radio"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={() => setRangeMode("multiple")}
            />
            複数選択
          </label>
        </div>
      </div>

      {/* カレンダー */}
      <div className="mb-6">
        <Calendar
          onChange={handleDateChange}
          value={rangeMode === "range" ? dates : null}
          selectRange={rangeMode === "range"}
          tileClassName={tileClassName}
        />
      </div>

      {/* 時間帯 */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold">時間帯</label>
        <select
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
          className="w-full p-2 rounded bg-black border border-gray-600 focus:ring-2 focus:ring-[#004CA0]"
        >
          <option value="終日">終日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>

      {/* 登録ボタン */}
      <button
        onClick={handleSubmit}
        className="w-full py-2 rounded bg-[#FDB9C8] text-black font-bold hover:bg-[#e79fb0] transition"
      >
        登録して共有リンクを発行
      </button>

      {/* 発行されたリンク */}
      {shareUrl && (
        <div className="mt-4 p-3 bg-[#222] rounded-lg text-center">
          <p>共有リンクが発行されました:</p>
          <a
            href={shareUrl}
            className="text-[#FDB9C8] underline break-all"
            target="_blank"
            rel="noreferrer"
          >
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
}
