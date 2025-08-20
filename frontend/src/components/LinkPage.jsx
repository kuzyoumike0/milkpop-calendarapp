import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CalendarWrapper from "./CalendarWrapper";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [shareLink, setShareLink] = useState(null);

  const navigate = useNavigate();

  const handleSave = () => {
    axios
      .post("/api/schedules/share", {
        title,
        dates,
        timeslot: timeSlot,
        startTime,
        endTime,
      })
      .then((res) => {
        setShareLink(`${window.location.origin}/share/${res.data.linkId}`);
        alert("共有リンクを発行しました！");
      })
      .catch((err) => {
        console.error(err);
        alert("保存に失敗しました");
      });
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-10">
        <h2 className="text-3xl font-extrabold mb-6 text-[#FDB9C8]">
          日程登録（共有リンク発行）
        </h2>

        {/* タイトル */}
        <div className="mb-4">
          <label className="block mb-2">タイトル</label>
          <input
            className="w-full px-4 py-2 rounded-xl text-black"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* カレンダー */}
        <div className="mb-4">
          <label className="block mb-2">日程選択</label>
          <CalendarWrapper mode={rangeMode} value={dates} onChange={setDates} />
        </div>

        {/* モード切替 */}
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

        {/* 時間帯 */}
        <div className="mb-4">
          <label className="block mb-2">時間帯</label>
          <select
            className="w-full px-4 py-2 rounded-xl text-black"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
          >
            <option value="全日">全日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
            <option value="時間指定">時間指定</option>
          </select>
        </div>

        {/* 時間指定プルダウン */}
        {timeSlot === "時間指定" && (
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block mb-2">開始時刻</label>
              <select
                className="px-3 py-2 rounded-lg text-black"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2">終了時刻</label>
              <select
                className="px-3 py-2 rounded-lg text-black"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="px-6 py-3 bg-[#FDB9C8] text-black rounded-2xl font-semibold shadow hover:bg-[#004CA0] hover:text-white transition"
        >
          保存 & 共有リンク発行
        </button>

        {/* 共有リンク表示 */}
        {shareLink && (
          <div className="mt-6">
            <p className="mb-2">発行された共有リンク:</p>
            <a
              href={shareLink}
              className="text-[#FDB9C8] underline hover:text-[#004CA0]"
            >
              {shareLink}
            </a>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
