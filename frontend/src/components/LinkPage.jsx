import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Header from "./Header";
import Footer from "./Footer";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [timeSlot, setTimeSlot] = useState("全日");
  const [rangeMode, setRangeMode] = useState("multiple");
  const [shareUrl, setShareUrl] = useState("");

  const handleRegister = () => {
    setShareUrl("https://milkpop-calendar.example.com/share/xxxxxx");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

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

        <div className="mb-6">
          <label className="block mb-2">日程選択</label>
          <Calendar
            selectRange={rangeMode === "range"}
            onChange={(value) => setDates(value)}
            value={dates}
          />
        </div>

        <div className="mb-6 flex gap-4">
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

      <Footer />
    </div>
  );
}
