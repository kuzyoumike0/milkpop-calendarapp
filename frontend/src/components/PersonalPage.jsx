import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { Link } from "react-router-dom";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [timeslot, setTimeslot] = useState("全日");
  const [message, setMessage] = useState("");

  // 日付フォーマット
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // 複数選択処理
  const handleDateChange = (value) => {
    const formatted = formatDate(value);
    if (dates.includes(formatted)) {
      setDates(dates.filter((d) => d !== formatted));
    } else {
      setDates([...dates, formatted]);
    }
  };

  // 保存処理
  const handleSave = async () => {
    try {
      await axios.post("/api/personal", {
        title,
        memo,
        dates,
        timeslot,
      });
      setMessage("✅ 個人スケジュールを保存しました");
      setTitle("");
      setMemo("");
      setDates([]);
      setTimeslot("全日");
    } catch (err) {
      console.error(err);
      setMessage("❌ 保存に失敗しました");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* バナー */}
      <header className="w-full bg-black/40 backdrop-blur-md shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-white drop-shadow">
          MilkPOP Calendar
        </h1>
        <nav className="flex gap-4">
          <Link to="/personal" className="text-white hover:text-[#FDB9C8] transition">
            個人スケジュール
          </Link>
          <Link to="/link" className="text-white hover:text-[#FDB9C8] transition">
            共有スケジュール
          </Link>
        </nav>
      </header>

      {/* メイン */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="backdrop-blur-lg bg-white/20 border border-white/30 
                        rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-white drop-shadow">
            📝 個人スケジュール登録
          </h2>

          {/* タイトル */}
          <label className="block mb-2 font-bold text-white">タイトル</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded-lg mb-4 bg-white/60 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FDB9C8]"
          />

          {/* メモ */}
          <label className="block mb-2 font-bold text-white">メモ</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full p-2 rounded-lg mb-4 bg-white/60 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FDB9C8]"
          />

          {/* カレンダー */}
          <label className="block mb-2 font-bold text-white">日付を選択</label>
          <Calendar
            onClickDay={handleDateChange}
            tileClassName={({ date }) =>
              dates.includes(formatDate(date))
                ? "bg-[#FDB9C8] text-white rounded-lg"
                : ""
            }
          />
          <p className="text-sm mt-2 text-white">
            選択中: {dates.length > 0 ? dates.join(", ") : "なし"}
          </p>

          {/* 時間帯選択 */}
          <label className="block mt-4 mb-2 font-bold text-white">時間帯</label>
          <select
            value={timeslot}
            onChange={(e) => setTimeslot(e.target.value)}
            className="w-full p-2 rounded-lg mb-6 bg-white/60 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FDB9C8]"
          >
            <option value="全日">全日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
            <option value="時間指定">時間指定（開始〜終了）</option>
          </select>

          {/* 保存ボタン */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-2xl font-bold shadow-md 
                       bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] text-white 
                       hover:opacity-90 transition"
          >
            💾 保存する
          </button>

          {/* メッセージ */}
          {message && (
            <p className="mt-4 text-center text-white font-semibold">
              {message}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
