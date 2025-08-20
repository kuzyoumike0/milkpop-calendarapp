import React, { useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [timeType, setTimeType] = useState("all"); // all, day, night, custom
  const [startTime, setStartTime] = useState("1");
  const [endTime, setEndTime] = useState("2");
  const [mode, setMode] = useState("multiple");

  // 日付選択処理
  const handleDateChange = (value) => {
    if (mode === "multiple") {
      const dateStr = value.toISOString().split("T")[0];
      setDates((prev) =>
        prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
      );
    } else {
      if (Array.isArray(value)) {
        const [start, end] = value;
        if (start && end) {
          const newDates = [];
          const current = new Date(start);
          while (current <= end) {
            newDates.push(current.toISOString().split("T")[0]);
            current.setDate(current.getDate() + 1);
          }
          setDates(newDates);
        }
      }
    }
  };

  // 保存処理
  const saveSchedule = async () => {
    if (!title || !memo || dates.length === 0) {
      alert("タイトル・メモ・日程を入力してください");
      return;
    }
    try {
      await axios.post("/api/personal", {
        title,
        memo,
        dates,
        timeType,
        startTime: timeType === "custom" ? startTime : null,
        endTime: timeType === "custom" ? endTime : null,
      });
      alert("保存しました！");
    } catch (err) {
      alert("保存に失敗しました");
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[#FDB9C8] mb-6">個人スケジュール登録</h1>

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
          rows="3"
        ></textarea>
      </div>

      {/* モード切替 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-[#FDB9C8] mb-2">選択モード</label>
        <div className="flex gap-6 text-white">
          <label>
            <input
              type="radio"
              value="multiple"
              checked={mode === "multiple"}
              onChange={(e) => setMode(e.target.value)}
            />{" "}
            複数選択
          </label>
          <label>
            <input
              type="radio"
              value="range"
              checked={mode === "range"}
              onChange={(e) => setMode(e.target.value)}
            />{" "}
            範囲選択
          </label>
        </div>
      </div>

      {/* カレンダー */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-[#FDB9C8] mb-2">日程選択</label>
        <Calendar
          selectRange={mode === "range"}
          onClickDay={mode === "multiple" ? handleDateChange : undefined}
          onChange={mode === "range" ? handleDateChange : undefined}
          tileClassName={({ date }) =>
            dates.includes(date.toISOString().split("T")[0])
              ? "bg-[#FDB9C8] text-black rounded-xl"
              : null
          }
        />
        <div className="mt-3 text-gray-400">
          {dates.length > 0 ? dates.join(", ") : "未選択"}
        </div>
      </div>

      {/* 時間帯 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-[#FDB9C8] mb-2">時間帯</label>
        <select
          value={timeType}
          onChange={(e) => setTimeType(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8] mb-3"
        >
          <option value="all">終日</option>
          <option value="day">昼</option>
          <option value="night">夜</option>
          <option value="custom">時間指定</option>
        </select>

        {timeType === "custom" && (
          <div className="flex gap-4">
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex-1 p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}時
                </option>
              ))}
            </select>
            <span className="text-white flex items-center">〜</span>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1 p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}時
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 保存ボタン */}
      <button
        onClick={saveSchedule}
        className="w-full bg-[#004CA0] hover:bg-[#FDB9C8] text-white font-bold py-3 px-6 rounded-xl transition"
      >
        保存
      </button>
    </div>
  );
}
