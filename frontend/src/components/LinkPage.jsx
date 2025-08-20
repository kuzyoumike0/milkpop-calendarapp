import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { Link } from "react-router-dom";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [timeslot, setTimeslot] = useState("全日");
  const [shareUrl, setShareUrl] = useState("");
  const [message, setMessage] = useState("");

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleDateChange = (value) => {
    const formatted = formatDate(value);
    if (dates.includes(formatted)) {
      setDates(dates.filter((d) => d !== formatted));
    } else {
      setDates([...dates, formatted]);
    }
  };

  const handleCreateLink = async () => {
    try {
      const res = await axios.post("/api/link", {
        title,
        dates,
        timeslot,
      });
      setShareUrl(`${window.location.origin}/share/${res.data.linkid}`);
      setMessage("✅ 共有リンクを作成しました！");
      setTitle("");
      setDates([]);
      setTimeslot("全日");
    } catch (err) {
      console.error(err);
      setMessage("❌ 共有リンク作成に失敗しました");
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
                        rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-black">
          <h2 className="text-2xl font-bold mb-6 text-center text-white drop-shadow">
            🤝 共有スケジュール登録
          </h2>

          {/* タイトル */}
          <label className="block mb-2 font-bold text-white">タイトル</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded-lg mb-4 bg-white/60 border border-gray-300"
          />

          {/* カレンダー */}
          <label className="block mb-2 font-bold text-white">日付を選択</label>
          <Calendar
            onClickDay={handleDateChange}
            tileClassName={({ date }) =>
              dates.includes(formatDate(date))
                ? "bg-[#004CA0] text-white rounded-lg"
                : ""
            }
          />
          <p className="text-sm mt-2 text-white">
            選択中: {dates.length > 0 ? dates.join(", ") : "なし"}
          </p>

          {/* 時間帯 */}
          <label className="block mt-4 mb-2 font-bold text-white">時間帯</label>
          <select
            value={timeslot}
            onChange={(e) => setTimeslot(e.target.value)}
            className="w-full p-2 rounded-lg mb-6 bg-white/60 border border-gray-300"
          >
            <option value="全日">全日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
          </select>

          {/* リンク発行ボタン */}
          <button
            onClick={handleCreateLink}
            className="w-full py-3 rounded-2xl font-bold shadow-md 
                       bg-gradient-to-r from-[#004CA0] to-[#FDB9C8] text-white 
                       hover:opacity-90 transition"
          >
            🔗 共有リンクを発行
          </button>

          {/* リンク表示 */}
          {shareUrl && (
            <div className="mt-6 text-center">
              <p className="text-white font-semibold">共有リンク:</p>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 px-4 py-2 rounded-xl 
                           bg-white/70 text-[#004CA0] font-bold shadow-md 
                           hover:bg-[#FDB9C8]/80 hover:text-black transition"
              >
                {shareUrl}
              </a>
            </div>
          )}

          {message && (
            <p className="mt-4 text-center text-white font-semibold">{message}</p>
          )}
        </div>
      </main>
    </div>
  );
}
