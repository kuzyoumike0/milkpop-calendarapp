import React, { useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("multiple"); // "multiple" or "range"

  // 日付選択処理
  const handleDateChange = (value) => {
    if (mode === "multiple") {
      // 複数選択モード
      const dateStr = value.toISOString().split("T")[0];
      setDates((prev) =>
        prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
      );
    } else {
      // 範囲選択モード
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

  // 共有リンク発行
  const generateLink = async () => {
    if (!title || dates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/schedules", { title, dates });
      setLink(`${window.location.origin}/share/${res.data.linkid}`);
    } catch (err) {
      alert("リンク発行に失敗しました");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[#FDB9C8] mb-6">日程登録ページ</h1>

      {/* タイトル入力 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-[#FDB9C8] mb-2">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-600 bg-black text-white focus:ring-2 focus:ring-[#FDB9C8]"
        />
      </div>

      {/* モード切り替え */}
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

      {/* リンク発行ボタン */}
      <button
        onClick={generateLink}
        disabled={loading}
        className="w-full bg-[#004CA0] hover:bg-[#FDB9C8] text-white font-bold py-3 px-6 rounded-xl transition"
      >
        {loading ? "発行中..." : "共有リンクを発行"}
      </button>

      {/* 発行されたリンク表示 */}
      {link && (
        <div className="mt-8 bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#FDB9C8] mb-2">発行されたリンク</h2>
          <div className="flex items-center justify-between">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 underline break-all"
            >
              {link}
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(link)}
              className="ml-3 bg-[#FDB9C8] text-black font-bold py-2 px-4 rounded-xl hover:bg-[#004CA0] hover:text-white transition"
            >
              コピー
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
