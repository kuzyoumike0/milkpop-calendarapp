import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [rangeMode, setRangeMode] = useState("multiple");
  const [dates, setDates] = useState([]);
  const [startTime, setStartTime] = useState("allday");
  const [endTime, setEndTime] = useState("");
  const [link, setLink] = useState("");

  // 時間プリセット
  const presets = [
    { value: "allday", label: "終日" },
    { value: "day", label: "昼 (9:00〜18:00)" },
    { value: "night", label: "夜 (18:00〜23:00)" },
  ];

  // 時刻リスト（1時〜0時）
  const hours = Array.from({ length: 24 }, (_, i) => i + 1).map(
    (h) => `${h}:00`
  );

  // 日付変更
  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      setDates(value);
    } else {
      setDates(value instanceof Date ? [value] : value);
    }
  };

  // 登録処理
  const handleSubmit = async () => {
    if (!title || dates.length === 0 || !startTime || !endTime) {
      alert("タイトル・日付・時間を入力してください");
      return;
    }
    try {
      const res = await axios.post("/api/schedule", {
        title,
        range_mode: rangeMode,
        dates: Array.isArray(dates)
          ? dates.map((d) => d.toISOString().split("T")[0])
          : [dates.toISOString().split("T")[0]],
        start_time: startTime,
        end_time: endTime,
      });
      setLink(res.data.link);
    } catch (err) {
      alert("リンク作成に失敗しました");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* タイトル */}
      <h1 className="text-3xl font-bold text-center text-[#FDB9C8] mb-8">
        共有スケジュール登録
      </h1>

      {/* カード */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
        {/* タイトル入力 */}
        <label className="block mb-2 text-gray-300">タイトル</label>
        <input
          type="text"
          className="w-full p-2 rounded-lg border border-gray-600 bg-black text-white mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 範囲選択/複数選択 */}
        <label className="block mb-2 text-gray-300">選択モード</label>
        <div className="flex gap-4 mb-4">
          <label className="text-gray-300">
            <input
              type="radio"
              value="range"
              checked={rangeMode === "range"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            範囲選択
          </label>
          <label className="text-gray-300">
            <input
              type="radio"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            複数選択
          </label>
        </div>

        {/* カレンダー */}
        <Calendar
          onChange={handleDateChange}
          value={dates}
          selectRange={rangeMode === "range"}
          tileClassName={({ date }) =>
            dates.some(
              (d) =>
                new Date(d).toDateString() === new Date(date).toDateString()
            )
              ? "bg-[#FDB9C8] text-black rounded-full"
              : ""
          }
          className="rounded-lg border border-gray-600 bg-black text-white p-2 mb-4"
        />

        {/* 時間帯選択 */}
        <label className="block mb-2 text-gray-300">時間帯</label>
        <div className="flex flex-wrap gap-4 mb-4">
          {presets.map((p) => (
            <label key={p.value} className="text-gray-300">
              <input
                type="radio"
                value={p.value}
                checked={startTime === p.value}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (e.target.value === "allday") setEndTime("23:59");
                  if (e.target.value === "day") setEndTime("18:00");
                  if (e.target.value === "night") setEndTime("23:00");
                }}
              />
              {p.label}
            </label>
          ))}
        </div>

        {/* 開始/終了時刻 */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block mb-2 text-gray-300">開始時刻</label>
            <select
              className="w-full p-2 rounded-lg border border-gray-600 bg-black text-white"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            >
              <option value="">選択してください</option>
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-2 text-gray-300">終了時刻</label>
            <select
              className="w-full p-2 rounded-lg border border-gray-600 bg-black text-white"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            >
              <option value="">選択してください</option>
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 発行ボタン */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#004CA0] hover:bg-[#003580] text-white py-2 rounded-xl font-bold shadow-lg transition"
        >
          共有リンクを発行
        </button>

        {/* 発行済みリンク表示 */}
        {link && (
          <p className="mt-4 text-center text-gray-300">
            共有リンク:{" "}
            <a
              href={link}
              className="text-[#FDB9C8] underline break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {window.location.origin + link}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
