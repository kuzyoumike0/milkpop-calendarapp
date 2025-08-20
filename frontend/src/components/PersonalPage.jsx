import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("multiple"); // multiple / range
  const [timeSlot, setTimeSlot] = useState("全日");
  const [saved, setSaved] = useState(false);

  // 日付選択
  const handleDateChange = (date) => {
    if (mode === "range") {
      setSelectedDates([date[0], date[1]]);
    } else {
      setSelectedDates(date instanceof Array ? date : [date]);
    }
  };

  // 保存処理
  const handleSave = async () => {
    await axios.post("/api/personal", {
      title,
      memo,
      dates: selectedDates,
      timeslot: timeSlot,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 backdrop-blur-lg bg-white/10 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-white text-center mb-6">
        📝 個人スケジュール登録
      </h2>

      {/* 入力フォーム */}
      <div className="grid gap-4 mb-6">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-4 py-2 rounded-lg border border-white/30 bg-black/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FDB9C8]"
        />
        <textarea
          placeholder="メモを入力（任意）"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          className="px-4 py-2 rounded-lg border border-white/30 bg-black/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FDB9C8]"
        />

        {/* 日付選択モード */}
        <div className="flex items-center gap-4 text-white">
          <label>
            <input
              type="radio"
              value="multiple"
              checked={mode === "multiple"}
              onChange={() => setMode("multiple")}
              className="mr-1"
            />
            複数日選択
          </label>
          <label>
            <input
              type="radio"
              value="range"
              checked={mode === "range"}
              onChange={() => setMode("range")}
              className="mr-1"
            />
            範囲選択
          </label>
        </div>

        {/* 時間帯選択 */}
        <select
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
          className="px-4 py-2 rounded-lg bg-black/30 border border-white/30 text-white"
        >
          <option value="全日">全日（終日）</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="時間指定">時間指定（1時〜0時）</option>
        </select>
      </div>

      {/* カレンダー */}
      <div className="mb-6 flex justify-center">
        <Calendar
          onChange={handleDateChange}
          value={selectedDates}
          selectRange={mode === "range"}
          tileClassName={({ date }) =>
            selectedDates.some(
              (d) =>
                new Date(d).toDateString() === date.toDateString()
            )
              ? "bg-[#FDB9C8] text-black rounded-lg"
              : ""
          }
        />
      </div>

      {/* 保存ボタン */}
      <div className="text-center">
        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-xl font-bold bg-[#004CA0] text-white shadow-md hover:bg-[#003580] transition"
        >
          保存
        </button>
      </div>

      {/* 保存完了メッセージ */}
      {saved && (
        <p className="mt-4 text-center text-[#FDB9C8] font-bold">
          ✅ 保存しました！
        </p>
      )}
    </div>
  );
}
