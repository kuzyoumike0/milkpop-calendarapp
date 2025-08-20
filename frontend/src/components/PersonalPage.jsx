import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple"); // "range" or "multiple"
  const [timeSlot, setTimeSlot] = useState("全日");
  const [schedules, setSchedules] = useState([]);

  // 即時反映のための取得関数
  const fetchSchedules = async () => {
    try {
      const res = await axios.get("/api/personal");
      setSchedules(res.data);
    } catch (err) {
      console.error("取得エラー:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // 登録処理
  const handleRegister = async () => {
    if (!title || dates.length === 0) {
      alert("タイトルと日付を入力してください");
      return;
    }
    try {
      await axios.post("/api/personal", {
        title,
        memo,
        dates: Array.isArray(dates) ? dates.map((d) => formatDate(d)) : [formatDate(dates)],
        timeslot: timeSlot,
        range_mode: rangeMode,
      });
      setTitle("");
      setMemo("");
      setDates([]);
      setTimeSlot("全日");
      setRangeMode("multiple");
      // 即時反映
      fetchSchedules();
    } catch (err) {
      console.error("登録エラー:", err);
    }
  };

  // 日付フォーマット
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // カレンダー選択ハンドラ
  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      setDates(value);
    } else {
      setDates(value instanceof Date ? [value] : value);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* バナー */}
      <header className="bg-[#004CA0] text-[#FDB9C8] text-3xl font-bold p-4 rounded-2xl shadow-lg flex justify-between">
        <span>MilkPOP Calendar</span>
        <nav className="space-x-4">
          <a href="/" className="hover:underline">トップ</a>
          <a href="/link" className="hover:underline">日程登録</a>
          <a href="/personal" className="hover:underline">個人スケジュール</a>
        </nav>
      </header>

      {/* 入力フォーム */}
      <div className="bg-[#1a1a1a] mt-6 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl mb-4">個人スケジュール登録</h2>
        <input
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
          type="text"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
          placeholder="メモ"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

        {/* 範囲選択 / 複数選択 */}
        <div className="mb-3">
          <label className="mr-4">
            <input
              type="radio"
              name="rangeMode"
              value="range"
              checked={rangeMode === "range"}
              onChange={(e) => setRangeMode(e.target.value)}
            />{" "}
            範囲選択
          </label>
          <label>
            <input
              type="radio"
              name="rangeMode"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={(e) => setRangeMode(e.target.value)}
            />{" "}
            複数選択
          </label>
        </div>

        {/* カレンダー */}
        <Calendar
          onChange={handleDateChange}
          value={dates}
          selectRange={rangeMode === "range"}
          allowMultiple={rangeMode === "multiple" ? true : undefined}
          className="mb-4 rounded-lg shadow-md"
        />

        {/* 時間帯選択 */}
        <select
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
        >
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          {/* 開始-終了時間の詳細選択 */}
          {Array.from({ length: 24 }).map((_, i) => (
            <option key={i} value={`${i}:00-${(i + 1) % 24}:00`}>
              {i}:00 - {(i + 1) % 24}:00
            </option>
          ))}
        </select>

        <button
          onClick={handleRegister}
          className="w-full bg-[#FDB9C8] text-black font-bold py-2 px-4 rounded-2xl shadow hover:bg-pink-400"
        >
          登録
        </button>
      </div>

      {/* 登録済みスケジュール一覧 */}
      <div className="bg-[#1a1a1a] mt-6 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl mb-4">登録済みスケジュール</h2>
        <ul className="space-y-2">
          {schedules.map((s) => (
            <li key={s.id} className="p-3 bg-gray-800 rounded">
              <strong>{s.title}</strong> ({s.memo})  
              <br />
              {s.date} - {s.timeslot} [{s.range_mode}]
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
