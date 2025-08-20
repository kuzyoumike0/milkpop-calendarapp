import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useHolidays } from "../hooks/useHolidays";
import { useNavigate } from "react-router-dom";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [timeslot, setTimeslot] = useState("全日");
  const [rangeMode, setRangeMode] = useState("multiple"); // "multiple" or "range"
  const holidays = useHolidays();
  const navigate = useNavigate();

  // 日付選択処理
  const toggleDate = (date) => {
    const iso = date.toISOString().split("T")[0];

    if (rangeMode === "multiple") {
      if (dates.includes(iso)) {
        setDates(dates.filter((d) => d !== iso));
      } else {
        setDates([...dates, iso]);
      }
    } else if (rangeMode === "range") {
      if (dates.length === 0) {
        setDates([iso]);
      } else if (dates.length === 1) {
        const start = new Date(dates[0]);
        const end = new Date(iso);
        const arr = [];
        const cur = new Date(Math.min(start, end));
        const last = new Date(Math.max(start, end));
        while (cur <= last) {
          arr.push(cur.toISOString().split("T")[0]);
          cur.setDate(cur.getDate() + 1);
        }
        setDates(arr);
      } else {
        setDates([iso]);
      }
    }
  };

  // 送信処理
  const handleSubmit = async () => {
    try {
      const res = await axios.post("/api/schedule", {
        title,
        dates,
        timeslot,
        range_mode: rangeMode,
      });
      if (res.data.link) {
        alert("共有リンクを発行しました！");
        navigate(res.data.link);
      }
    } catch (err) {
      console.error("登録エラー:", err);
      alert("登録に失敗しました。");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">日程登録（共有リンク発行）</h1>

      {/* タイトル入力 */}
      <input
        className="w-full p-2 mb-4 bg-gray-800 rounded"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* モード選択 */}
      <div className="flex space-x-4 mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="multiple"
            checked={rangeMode === "multiple"}
            onChange={() => setRangeMode("multiple")}
          />
          <span>複数選択</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="range"
            checked={rangeMode === "range"}
            onChange={() => setRangeMode("range")}
          />
          <span>範囲選択</span>
        </label>
      </div>

      {/* 時間帯選択 */}
      <select
        className="w-full p-2 mb-4 bg-gray-800 rounded"
        value={timeslot}
        onChange={(e) => setTimeslot(e.target.value)}
      >
        <option value="全日">全日</option>
        <option value="昼">昼</option>
        <option value="夜">夜</option>
      </select>

      {/* カレンダー */}
      <Calendar
        onClickDay={toggleDate}
        tileClassName={({ date }) => {
          const iso = date.toISOString().split("T")[0];
          if (dates.includes(iso)) {
            return "bg-blue-600 text-white rounded-full";
          }
          if (holidays.includes(iso)) {
            return "text-red-500 font-bold";
          }
          return "";
        }}
        locale="ja-JP"
      />

      {/* 登録ボタン */}
      <button
        onClick={handleSubmit}
        className="mt-6 w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-500"
      >
        登録 & リンク発行
      </button>

      {/* 選択済み日程の確認 */}
      <div className="mt-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">選択済みスケジュール</h2>
        <ul className="space-y-2">
          {dates.map((d, idx) => (
            <li key={idx} className="bg-gray-800 p-3 rounded-lg">
              <strong>{title || "（タイトル未設定）"}</strong> ({timeslot})<br />
              {d}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
