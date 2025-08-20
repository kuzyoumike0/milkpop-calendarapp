import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeMode, setTimeMode] = useState("終日");
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [saved, setSaved] = useState(false);

  // 時間リスト生成 (1時〜0時)
  const hours = Array.from({ length: 24 }, (_, i) => (i === 0 ? "0" : i));

  const handleCalendarChange = (value) => {
    if (rangeMode === "multiple") {
      const dates = Array.isArray(value) ? value : [value];
      setSelectedDates(dates);
    } else {
      if (Array.isArray(value)) {
        setSelectedDates(value);
      }
    }
  };

  const handleSave = async () => {
    try {
      await axios.post("/api/personal", {
        title,
        memo,
        dates: selectedDates,
        timeMode,
        startHour,
        endHour,
      });
      setSaved(true);
    } catch (err) {
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[#FDB9C8] mb-6">
        個人日程登録ページ
      </h1>

      {/* 入力フォームカード */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-8">
        {/* タイトル入力 */}
        <label className="block text-[#FDB9C8] mb-2">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 mb-4 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
        />

        {/* メモ入力 */}
        <label className="block text-[#FDB9C8] mb-2">メモ</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full p-3 mb-4 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
        />

        {/* モード選択 */}
        <div className="mb-4">
          <label className="block text-[#FDB9C8] mb-2">選択モード</label>
          <div className="flex gap-6 text-gray-300">
            <label>
              <input
                type="radio"
                value="multiple"
                checked={rangeMode === "multiple"}
                onChange={(e) => setRangeMode(e.target.value)}
                className="mr-2"
              />
              複数選択
            </label>
            <label>
              <input
                type="radio"
                value="range"
                checked={rangeMode === "range"}
                onChange={(e) => setRangeMode(e.target.value)}
                className="mr-2"
              />
              範囲選択
            </label>
          </div>
        </div>

        {/* カレンダー */}
        <div className="mb-6">
          <Calendar
            selectRange={rangeMode === "range"}
            onChange={handleCalendarChange}
            value={selectedDates}
          />
        </div>

        {/* 時間帯プルダウン */}
        <div className="mb-4">
          <label className="block text-[#FDB9C8] mb-2">時間帯</label>
          <select
            value={timeMode}
            onChange={(e) => setTimeMode(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
          >
            <option value="終日">終日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
            <option value="時間指定">時間指定</option>
          </select>
        </div>

        {/* 時間指定時のみ表示 */}
        {timeMode === "時間指定" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">開始時刻</label>
              <select
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
              >
                <option value="">選択</option>
                {hours.map((h) => (
                  <option key={h} value={h}>{`${h}時`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">終了時刻</label>
              <select
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
              >
                <option value="">選択</option>
                {hours.map((h) => (
                  <option key={h} value={h}>{`${h}時`}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        className="w-full bg-[#004CA0] hover:bg-[#FDB9C8] text-white font-bold py-3 px-6 rounded-xl transition"
      >
        保存する
      </button>

      {/* 保存済みメッセージ */}
      {saved && (
        <div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded-xl text-center">
          <p className="text-[#FDB9C8] font-bold">保存しました！</p>
        </div>
      )}
    </div>
  );
}
