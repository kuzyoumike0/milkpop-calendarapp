import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeslot, setTimeslot] = useState("終日");
  const [startTime, setStartTime] = useState("1:00");
  const [endTime, setEndTime] = useState("2:00");
  const [savedSchedules, setSavedSchedules] = useState([]);

  // カレンダー選択
  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      setDates(value);
    } else {
      setDates(value instanceof Date ? [value] : value);
    }
  };

  // 保存処理
  const handleSave = async () => {
    if (timeslot === "時間指定") {
      if (new Date(`2020-01-01 ${endTime}`) <= new Date(`2020-01-01 ${startTime}`)) {
        alert("終了時刻は開始時刻より後にしてください");
        return;
      }
    }

    const res = await axios.post("/api/personal", {
      title,
      memo,
      dates,
      timeslot,
      startTime: timeslot === "時間指定" ? startTime : null,
      endTime: timeslot === "時間指定" ? endTime : null,
      rangeMode,
    });

    setSavedSchedules([...savedSchedules, res.data]);
    setTitle("");
    setMemo("");
    setDates([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#FDB9C8] mb-6">個人日程登録ページ</h1>

      {/* タイトル */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-[#FDB9C8] mb-2">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
        />
      </div>

      {/* メモ */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-[#FDB9C8] mb-2">メモ</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
        />
      </div>

      {/* カレンダー */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-[#FDB9C8] mb-3">日程選択</label>
        <div className="flex space-x-4 mb-4">
          <label className="text-gray-300">
            <input
              type="radio"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={() => setRangeMode("multiple")}
              className="mr-2"
            />
            複数選択
          </label>
          <label className="text-gray-300">
            <input
              type="radio"
              value="range"
              checked={rangeMode === "range"}
              onChange={() => setRangeMode("range")}
              className="mr-2"
            />
            範囲選択
          </label>
        </div>

        <Calendar
          onChange={handleDateChange}
          value={dates}
          selectRange={rangeMode === "range"}
          tileClassName={({ date }) =>
            dates.some(
              (d) => new Date(d).toDateString() === date.toDateString()
            )
              ? "bg-[#004CA0] text-white rounded-lg"
              : ""
          }
        />
      </div>

      {/* 時間帯 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#FDB9C8] mb-3">時間帯</h2>
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
        >
          <option value="終日">終日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="時間指定">時間指定</option>
        </select>
      </div>

      {/* 時間指定のときのみ表示 */}
      {timeslot === "時間指定" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-[#FDB9C8] mb-2">開始時刻</h2>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
            >
              {Array.from({ length: 24 }).map((_, i) => {
                const hour = (i + 1) % 24;
                return (
                  <option key={hour} value={`${hour}:00`}>
                    {hour}:00
                  </option>
                );
              })}
            </select>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-[#FDB9C8] mb-2">終了時刻</h2>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
            >
              {Array.from({ length: 24 }).map((_, i) => {
                const hour = (i + 1) % 24;
                return (
                  <option key={hour} value={`${hour}:00`}>
                    {hour}:00
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        className="w-full bg-[#004CA0] hover:bg-[#FDB9C8] text-white font-bold py-3 px-6 rounded-xl transition"
      >
        保存
      </button>

      {/* 登録済み一覧 */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-[#FDB9C8] mb-4">登録済みスケジュール</h2>
        <div className="grid gap-6">
          {savedSchedules.map((s, idx) => (
            <div
              key={idx}
              className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold text-[#FDB9C8]">{s.title}</h3>
              <p className="text-gray-400">{s.memo}</p>
              <p className="text-gray-400">日程: {JSON.stringify(s.dates)}</p>
              <p className="text-gray-400">
                時間帯:{" "}
                {s.timeslot === "時間指定"
                  ? `${s.startTime}〜${s.endTime}`
                  : s.timeslot}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
