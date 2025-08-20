import React, { useState } from "react";
import { Link } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [timeSlot, setTimeSlot] = useState("全日");
  const [rangeMode, setRangeMode] = useState("multiple"); // multiple or range
  const [shareUrl, setShareUrl] = useState("");

  const handleRegister = () => {
    // ここでバックエンドAPIにPOST
    // shareUrlを受け取ったら反映
    setShareUrl("https://milkpop-calendar.example.com/share/xxxxxx");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* バナー */}
      <header className="bg-[#004CA0] py-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center px-6">
          <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
          <nav className="space-x-4">
            <Link
              to="/link"
              className="px-4 py-2 bg-[#FDB9C8] text-black rounded-2xl shadow hover:scale-105 transition"
            >
              日程登録
            </Link>
            <Link
              to="/personal"
              className="px-4 py-2 bg-[#FDB9C8] text-black rounded-2xl shadow hover:scale-105 transition"
            >
              個人スケジュール
            </Link>
          </nav>
        </div>
      </header>

      {/* メイン */}
      <main className="flex-1 container mx-auto px-6 py-10">
        <h2 className="text-3xl font-extrabold mb-6 text-[#FDB9C8]">
          日程登録ページ
        </h2>

        <div className="mb-6">
          <label className="block mb-2">タイトル</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-xl text-black"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* カレンダー */}
        <div className="mb-6">
          <label className="block mb-2">日程選択</label>
          <Calendar
            selectRange={rangeMode === "range"}
            onChange={(value) => setDates(value)}
            value={dates}
          />
        </div>

        {/* モード切り替え */}
        <div className="mb-6">
          <label className="block mb-2">選択モード</label>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                name="mode"
                value="range"
                checked={rangeMode === "range"}
                onChange={() => setRangeMode("range")}
              />
              範囲選択
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="multiple"
                checked={rangeMode === "multiple"}
                onChange={() => setRangeMode("multiple")}
              />
              複数選択
            </label>
          </div>
        </div>

        {/* 時間帯選択 */}
        <div className="mb-6">
          <label className="block mb-2">時間帯</label>
          <select
            className="w-full px-4 py-2 rounded-xl text-black"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
          >
            <option value="全日">全日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
          </select>
        </div>

        <button
          onClick={handleRegister}
          className="px-6 py-3 bg-[#FDB9C8] text-black rounded-2xl font-semibold shadow hover:bg-[#004CA0] hover:text-white transition"
        >
          登録 & 共有リンク発行
        </button>

        {shareUrl && (
          <p className="mt-6">
            共有リンク:{" "}
            <a
              href={shareUrl}
              className="text-[#FDB9C8] underline hover:text-white"
            >
              {shareUrl}
            </a>
          </p>
        )}
      </main>
    </div>
  );
}
