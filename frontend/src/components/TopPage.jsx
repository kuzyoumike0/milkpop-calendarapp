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

  const tileClassName = ({ date }) => {
    const ymd = date.toISOString().split("T")[0];
    if (holidays.includes(ymd)) return "text-red-500 font-bold";
    return null;
  };

  const handleSubmit = async () => {
    const res = await axios.post("/api/schedules", {
      title,
      dates,
      range_mode: rangeMode,
      timeslot: timeSlot,
    });
    setLink(`${window.location.origin}/share/${res.data.linkid}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#FDB9C8]">日程登録ページ</h2>
      <input
        type="text"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 border rounded text-black w-full"
      />

      {/* 選択モード */}
      <div className="flex space-x-4">
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

      <button
        onClick={handleSubmit}
        className="px-6 py-3 bg-[#004CA0] text-white rounded-xl shadow hover:bg-[#FDB9C8] hover:text-black transition"
      >
        共有リンク発行
      </button>

      {link && <ShareButton link={link} />}
    </div>
  );
}
