import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [saved, setSaved] = useState(false);

  // 日付クリック処理
  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      setSelectedDates(value);
    } else {
      const dateStr = value.toISOString().split("T")[0];
      setSelectedDates((prev) =>
        prev.includes(dateStr)
          ? prev.filter((d) => d !== dateStr)
          : [...prev, dateStr]
      );
    }
  };

  // 保存処理（個人用 → DB保存だが共有リンクなし）
  const handleSave = async () => {
    try {
      await axios.post("/api/schedules", {
        title,
        memo,
        dates: selectedDates,
        timeslot: timeSlot,
        range_mode: rangeMode,
        is_personal: true, // 個人用フラグ
      });
      setSaved(true);
    } catch (err) {
      console.error("個人スケジュール保存エラー:", err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-3xl font-bold text-white mt-6 mb-6">
        個人用スケジュール登録
      </h1>

      {!saved ? (
        <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-2xl p-6 w-full max-w-lg">
          {/* タイトル */}
          <input
            type="text"
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 mb-4"
          />

          {/* メモ */}
          <textarea
            placeholder="メモを入力"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 mb-4"
            rows={3}
          />

          {/* 範囲 / 複数選択 */}
          <div className="mb-4 text-white">
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

          {/* カレンダー */}
          <Calendar
            onChange={handleDateChange}
            value={selectedDates}
            selectRange={rangeMode === "range"}
            tileClassName={({ date }) =>
              selectedDates.includes(date.toISOString().split("T")[0])
                ? "bg-[#FDB9C8] text-black rounded-lg"
                : ""
            }
          />

          {/* 時間帯 */}
          <div className="mt-4">
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300"
            >
              <option value="全日">全日</option>
              <option value="昼">昼</option>
              <option value="夜">夜</option>
              <option value="時間指定">時間指定（1時〜0時）</option>
            </select>
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSave}
            className="mt-6 px-6 py-3 rounded-xl bg-[#004CA0] text-white font-bold shadow-md hover:bg-[#003380] transition"
          >
            保存する
          </button>
        </div>
      ) : (
        <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-2xl p-6 w-full max-w-lg text-white">
          <h2 className="text-2xl font-bold text-[#FDB9C8] mb-4">✅ 保存完了！</h2>
          <p className="mb-2">タイトル: {title}</p>
          <p className="mb-2">メモ: {memo}</p>
          <p className="mb-2">選択日数: {Array.isArray(selectedDates) ? selectedDates.length : 0} 日</p>
          <p className="mb-2">時間帯: {timeSlot}</p>
        </div>
      )}
    </div>
  );
}
