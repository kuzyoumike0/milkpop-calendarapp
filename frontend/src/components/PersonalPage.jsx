import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [mode, setMode] = useState("range"); // range or multiple
  const [dates, setDates] = useState([]);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [timeType, setTimeType] = useState("終日");
  const [startTime, setStartTime] = useState("01:00");
  const [endTime, setEndTime] = useState("02:00");
  const [saved, setSaved] = useState(false);

  // 時間リスト生成（1時〜0時）
  const hours = Array.from({ length: 24 }, (_, i) =>
    `${String((i + 1) % 24).padStart(2, "0")}:00`
  );

  const handleCalendarChange = (value) => {
    if (mode === "range") {
      setDates(value);
    } else {
      // 複数選択
      const dateStr = value.toISOString().split("T")[0];
      setDates((prev) =>
        prev.some((d) => d.toISOString().split("T")[0] === dateStr)
          ? prev.filter((d) => d.toISOString().split("T")[0] !== dateStr)
          : [...prev, value]
      );
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post("/api/personal", {
        title,
        memo,
        dates: Array.isArray(dates)
          ? dates.map((d) => d.toISOString().split("T")[0])
          : [dates.toISOString().split("T")[0]],
        timeType,
        startTime: timeType === "時間指定" ? startTime : null,
        endTime: timeType === "時間指定" ? endTime : null,
      });
      setSaved(true);
    } catch (err) {
      console.error("個人スケジュール保存失敗:", err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--brand-black)] flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl card">
        <h2 className="card-title text-center">個人スケジュール登録</h2>

        {/* タイトル入力 */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">タイトル</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-neutral-800 text-white focus:ring-2 focus:ring-[color:var(--brand-pink)]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトルを入力"
          />
        </div>

        {/* メモ */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">メモ</label>
          <textarea
            className="w-full p-2 rounded bg-neutral-800 text-white focus:ring-2 focus:ring-[color:var(--brand-pink)]"
            rows="3"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモを入力"
          />
        </div>

        {/* 選択モード */}
        <div className="mb-6">
          <span className="text-gray-300 mr-4">選択モード:</span>
          <label className="mr-4">
            <input
              type="radio"
              name="mode"
              value="range"
              checked={mode === "range"}
              onChange={(e) => setMode(e.target.value)}
            />{" "}
            範囲選択
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              value="multiple"
              checked={mode === "multiple"}
              onChange={(e) => setMode(e.target.value)}
            />{" "}
            複数選択
          </label>
        </div>

        {/* カレンダー */}
        <div className="mb-6">
          <Calendar
            onChange={handleCalendarChange}
            selectRange={mode === "range"}
            value={dates}
            className="rounded-xl"
          />
        </div>

        {/* 時間帯プルダウン */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">時間帯</label>
          <select
            className="w-full p-2 rounded bg-neutral-800 text-white mb-3"
            value={timeType}
            onChange={(e) => setTimeType(e.target.value)}
          >
            <option>終日</option>
            <option>昼</option>
            <option>夜</option>
            <option>時間指定</option>
          </select>

          {timeType === "時間指定" && (
            <div className="flex space-x-4">
              <select
                className="flex-1 p-2 rounded bg-neutral-800 text-white"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                {hours.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
              <select
                className="flex-1 p-2 rounded bg-neutral-800 text-white"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              >
                {hours
                  .filter((h) => h > startTime)
                  .map((h) => (
                    <option key={h}>{h}</option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* 保存ボタン */}
        <div className="text-center">
          <button onClick={handleSubmit} className="btn">
            保存
          </button>
        </div>

        {saved && (
          <p className="text-center text-[color:var(--brand-pink)] mt-4">
            保存しました！
          </p>
        )}
      </div>
    </div>
  );
}
