import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import Holidays from "date-holidays";

const hd = new Holidays("JP"); // 🇯🇵 祝日対応

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple"); // default: 複数選択
  const [timeslot, setTimeslot] = useState("全日");
  const [schedules, setSchedules] = useState([]);

  // === DBからスケジュール取得 ===
  const fetchSchedules = async () => {
    try {
      const res = await axios.get("/api/personal");
      setSchedules(res.data);
    } catch (err) {
      console.error("取得失敗:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // === スケジュール登録 ===
  const handleSubmit = async () => {
    if (!title || dates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }
    try {
      await axios.post("/api/personal", {
        title,
        memo,
        dates,
        timeslot,
        rangeMode,
      });
      setTitle("");
      setMemo("");
      setDates([]);
      setTimeslot("全日");
      await fetchSchedules(); // 即時反映
    } catch (err) {
      console.error("登録失敗:", err);
      alert("保存に失敗しました");
    }
  };

  // === Calendar の tileClassName（祝日・選択スタイル） ===
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      if (hd.isHoliday(date)) {
        return "holiday"; // 祝日赤色
      }
      if (dates.some((d) => new Date(d).toDateString() === date.toDateString())) {
        return "selected-day"; // 選択日強調
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
        個人スケジュール登録
      </h2>

      <input
        className="border p-2 mb-2 w-full rounded"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="border p-2 mb-2 w-full rounded"
        placeholder="メモ"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
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
        登録
      </button>

      <h3 className="text-xl font-semibold mt-6 mb-2 text-[#004CA0]">
        登録済みスケジュール
      </h3>
      <ul className="list-disc ml-5">
        {schedules.map((s) => (
          <li key={s.id}>
            {s.title} ({s.dates.join(", ")}) [{s.timeslot}] - {s.memo}
          </li>
        ))}
      </ul>
    </div>
  );
}
