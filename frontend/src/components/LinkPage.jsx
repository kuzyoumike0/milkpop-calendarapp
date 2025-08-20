import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import ShareButton from "./ShareButton";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [holidays, setHolidays] = useState([]);
  const [link, setLink] = useState("");

  useEffect(() => {
    axios.get("/api/holidays").then((res) => setHolidays(res.data));
  }, []);

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    const ymd = date.toISOString().split("T")[0];

    // 祝日
    if (holidays.includes(ymd)) return "text-red-500 font-bold";

    // 選択モードによってスタイルを変える
    if (rangeMode === "multiple" && dates?.some?.((d) => d.toISOString().split("T")[0] === ymd)) {
      return "bg-[#FDB9C8] text-black rounded-full font-bold";
    }
    if (rangeMode === "range" && Array.isArray(dates) && dates.length === 2) {
      const start = new Date(dates[0]);
      const end = new Date(dates[1]);
      if (date >= start && date <= end) {
        return "bg-[#004CA0] text-white font-bold";
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const res = await axios.post("/api/schedules", {
      title,
      dates,
      range_mode: rangeMode,
      timeslot: timeSlot,
    });
    const newLink = `${window.location.origin}/share/${res.data.linkid}`;
    setLink(newLink);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#FDB9C8]">日程登録ページ</h2>

      {/* タイトル入力 */}
      <input
        type="text"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 border rounded text-black w-full"
      />

      {/* 選択モード */}
      <div className="flex space-x-6 items-center">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="range"
            checked={rangeMode === "range"}
            onChange={() => setRangeMode("range")}
          />
          <span className="text-sm">範囲選択</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="multiple"
            checked={rangeMode === "multiple"}
            onChange={() => setRangeMode("multiple")}
          />
          <span className="text-sm">複数選択</span>
        </label>
        <span className="ml-4 text-xs text-gray-400">
          {rangeMode === "range"
            ? "開始日と終了日をクリックしてください"
            : "複数の日付をクリックしてください"}
        </span>
      </div>

      {/* カレンダー */}
      <Calendar
        onChange={setDates}
        value={dates}
        selectRange={rangeMode === "range"}
        tileClassName={tileClassName}
      />

      {/* 時間帯選択 */}
      <select
        value={timeSlot}
        onChange={(e) => setTimeSlot(e.target.value)}
        className="p-2 border rounded text-black"
      >
        <option value="全日">全日</option>
        <option value="昼">昼</option>
        <option value="夜">夜</option>
      </select>

      {/* 登録ボタン */}
      <button
        onClick={handleSubmit}
        className="px-6 py-3 bg-[#004CA0] text-white rounded-xl shadow hover:bg-[#FDB9C8] hover:text-black transition"
      >
        共有リンク発行
      </button>

      {/* 発行されたリンクを表示 */}
      {link && (
        <div className="mt-4 space-y-2">
          <p className="text-green-400 font-bold">✅ 共有リンクを発行しました:</p>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline break-all"
          >
            {link}
          </a>
          <ShareButton link={link} />
        </div>
      )}
    </div>
  );
}
