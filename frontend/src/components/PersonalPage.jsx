import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useHolidays } from "../hooks/useHolidays";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [timeslot, setTimeslot] = useState("全日");
  const [rangeMode, setRangeMode] = useState("multiple");
  const holidays = useHolidays();

  // 日付選択（複数 & 範囲）
  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      if (Array.isArray(value)) {
        const start = value[0];
        const end = value[1];
        if (start && end) {
          const range = [];
          const cur = new Date(start);
          while (cur <= end) {
            range.push(new Date(cur).toISOString().split("T")[0]);
            cur.setDate(cur.getDate() + 1);
          }
          setDates(range);
        }
      }
    } else {
      // multiple
      if (!Array.isArray(dates)) setDates([]);
      const iso = value.toISOString().split("T")[0];
      if (dates.includes(iso)) {
        setDates(dates.filter((d) => d !== iso));
      } else {
        setDates([...dates, iso]);
      }
    }
  };

  // 登録処理
  const handleSubmit = async () => {
    if (!title || dates.length === 0) {
      alert("タイトルと日付を入力してください");
      return;
    }
    try {
      await axios.post("/api/personal", {
        title,
        memo,
        dates,
        timeslot,
        range_mode: rangeMode,
      });
      alert("個人スケジュールを登録しました！");
      setTitle("");
      setMemo("");
      setDates([]);
    } catch (err) {
      console.error("登録エラー:", err);
      alert("登録に失敗しました。");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">個人スケジュール登録</h1>

      {/* タイトル入力 */}
      <input
        className="w-full p-2 mb-4 bg-gray-800 rounded"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* メモ入力 */}
      <textarea
        className="w-full p-2 mb-4 bg-gray-800 rounded"
        placeholder="メモ (任意)"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      {/* モード切り替え */}
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            value="multiple"
            checked={rangeMode === "multiple"}
            onChange={() => setRangeMode("multiple")}
          />{" "}
          複数選択
        </label>
        <label>
          <input
            type="radio"
            value="range"
            checked={rangeMode === "range"}
            onChange={() => setRangeMode("range")}
          />{" "}
          範囲選択
        </label>
      </div>

      {/* カレンダー */}
      <Calendar
        selectRange={rangeMode === "range"}
        onClickDay={handleDateChange}
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

      {/* 時間帯選択 */}
      <select
        className="mt-6 w-full p-2 bg-gray-800 rounded"
        value={timeslot}
        onChange={(e) => setTimeslot(e.target.value)}
      >
        <option value="全日">全日</option>
        <option value="昼">昼</option>
        <option value="夜">夜</option>
      </select>

      {/* 登録ボタン */}
      <button
        onClick={handleSubmit}
        className="mt-6 w-full py-3 bg-green-600 rounded-lg hover:bg-green-500"
      >
        登録する
      </button>

      {/* 選択済み表示 */}
      <div className="mt-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">選択済み日程</h2>
        <ul className="space-y-2">
          {dates.map((d, idx) => (
            <li key={idx} className="bg-gray-800 p-3 rounded-lg">
              {d} ({timeslot})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
