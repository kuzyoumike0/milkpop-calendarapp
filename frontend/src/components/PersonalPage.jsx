// frontend/src/components/PersonalPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import { Link } from "react-router-dom";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const PersonalPage = () => {
  const [mode, setMode] = useState("range"); // "range" or "multi"
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [timeType, setTimeType] = useState("all");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("01:00");
  const [saved, setSaved] = useState([]);

  const hours = [...Array(25).keys()].map((h) =>
    String(h).padStart(2, "0") + ":00"
  );

  // ===== 複数選択クリック =====
  const handleMultiClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    setMultiDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  // ===== 保存 =====
  const handleSave = () => {
    if (!title.trim()) {
      alert("タイトルを入力してください");
      return;
    }
    let dates = [];
    if (mode === "range" && range[0] && range[1]) {
      let current = new Date(range[0]);
      while (current <= range[1]) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    } else if (mode === "multi") {
      dates = [...multiDates];
    }

    if (dates.length === 0) {
      alert("日程を選択してください");
      return;
    }

    const newItem = {
      id: Date.now(),
      title,
      memo,
      dates,
      timeType,
      startTime,
      endTime,
    };
    setSaved((prev) => [...prev, newItem]);

    // 入力をクリア
    setTitle("");
    setMemo("");
    setRange([null, null]);
    setMultiDates([]);
    setTimeType("all");
    setStartTime("00:00");
    setEndTime("01:00");
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* ===== バナー ===== */}
      <header className="bg-[#004CA0] text-white py-4 shadow-md flex justify-between items-center px-6">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
        <nav className="space-x-4">
          <Link
            to="/register"
            className="px-3 py-2 rounded-lg bg-[#FDB9C8] text-black font-semibold hover:opacity-80"
          >
            日程登録ページ
          </Link>
          <Link
            to="/personal"
            className="px-3 py-2 rounded-lg bg-[#FDB9C8] text-black font-semibold hover:opacity-80"
          >
            個人スケジュール
          </Link>
        </nav>
      </header>

      {/* ===== メイン ===== */}
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-bold mb-6 text-[#FDB9C8]">個人スケジュール登録</h2>

        {/* 入力フォーム */}
        <div className="space-y-6 mb-10 bg-[#1a1a1a] p-6 rounded-xl shadow-lg">
          <div>
            <label className="block mb-2">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg text-black"
              placeholder="タイトルを入力"
            />
          </div>

          <div>
            <label className="block mb-2">メモ</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full p-3 rounded-lg text-black"
              placeholder="メモを入力"
            />
          </div>

          {/* カレンダー */}
          <div>
            <label className="block mb-2">日程選択</label>
            <div className="flex gap-4 mb-4">
              <label>
                <input
                  type="radio"
                  value="range"
                  checked={mode === "range"}
                  onChange={(e) => setMode(e.target.value)}
                  className="mr-2"
                />
                範囲選択
              </label>
              <label>
                <input
                  type="radio"
                  value="multi"
                  checked={mode === "multi"}
                  onChange={(e) => setMode(e.target.value)}
                  className="mr-2"
                />
                複数選択
              </label>
            </div>
            {mode === "range" ? (
              <Calendar
                onChange={setRange}
                selectRange
                value={range}
                className="rounded-lg shadow-md"
              />
            ) : (
              <Calendar
                onClickDay={handleMultiClick}
                tileClassName={({ date }) => {
                  const dateStr = date.toISOString().split("T")[0];
                  return multiDates.includes(dateStr) ? "bg-[#FDB9C8] text-black rounded-lg" : "";
                }}
              />
            )}
          </div>

          {/* 時間帯 */}
          <div>
            <label className="block mb-2">時間帯</label>
            <select
              value={timeType}
              onChange={(e) => setTimeType(e.target.value)}
              className="p-3 rounded-lg text-black"
            >
              <option value="all">終日</option>
              <option value="morning">午前</option>
              <option value="afternoon">午後</option>
              <option value="custom">時間指定</option>
            </select>
          </div>

          {timeType === "custom" && (
            <div className="flex gap-4">
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="p-3 rounded-lg text-black"
              >
                {hours.slice(0, -1).map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span className="self-center">〜</span>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="p-3 rounded-lg text-black"
              >
                {hours
                  .filter((h) => h > startTime)
                  .map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl bg-[#FDB9C8] text-black font-bold shadow-lg hover:opacity-80"
            >
              保存
            </button>
          </div>
        </div>

        {/* 保存済み一覧 */}
        <h3 className="text-lg font-bold mb-4 text-[#FDB9C8]">保存済みスケジュール</h3>
        <div className="space-y-4">
          {saved.map((item) => (
            <div
              key={item.id}
              className="bg-[#1a1a1a] rounded-xl shadow p-4"
            >
              <p className="font-semibold text-lg text-[#FDB9C8]">{item.title}</p>
              <p className="text-gray-300 mb-2">{item.memo}</p>
              <p className="text-gray-400">
                {item.dates.join(", ")} |{" "}
                {item.timeType === "custom"
                  ? `${item.startTime}〜${item.endTime}`
                  : item.timeType}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PersonalPage;
