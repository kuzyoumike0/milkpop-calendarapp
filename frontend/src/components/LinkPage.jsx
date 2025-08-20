import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple"); // "range" | "multiple"
  const [timeSlot, setTimeSlot] = useState("全日");
  const [schedules, setSchedules] = useState([]);
  const [shareUrl, setShareUrl] = useState("");

  // 即時反映のための取得関数
  const fetchSchedules = async () => {
    try {
      const res = await axios.get("/api/schedules");
      setSchedules(res.data);
    } catch (err) {
      console.error("取得エラー:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // 日付フォーマット
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // カレンダー選択
  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      setDates(value);
    } else {
      if (value instanceof Date) {
        const formatted = formatDate(value);
        setDates((prev) =>
          prev.includes(formatted)
            ? prev.filter((d) => d !== formatted)
            : [...prev, formatted]
        );
      }
    }
  };

  // 登録処理
  const handleRegister = async () => {
    if (!title || dates.length === 0) {
      alert("タイトルと日付を入力してください");
      return;
    }
    try {
      await axios.post("/api/schedules", {
        title,
        dates: Array.isArray(dates)
          ? dates.map((d) => (d instanceof Date ? formatDate(d) : d))
          : [formatDate(dates)],
        timeslot: timeSlot,
        range_mode: rangeMode,
      });
      setTitle("");
      setDates([]);
      setTimeSlot("全日");
      setRangeMode("multiple");
      fetchSchedules();
    } catch (err) {
      console.error("登録エラー:", err);
    }
  };

  // 共有リンク発行
  const handleShare = async () => {
    if (!title) {
      alert("共有リンクを作成するにはタイトルを入力してください");
      return;
    }
    try {
      const res = await axios.post("/api/share", { title });
      setShareUrl(window.location.origin + res.data.link);
    } catch (err) {
      console.error("リンク作成エラー:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* バナー */}
      <header className="bg-[#004CA0] text-[#FDB9C8] text-3xl font-bold p-4 rounded-2xl shadow-lg flex justify-between">
        <span>MilkPOP Calendar</span>
        <nav className="space-x-4">
          <a href="/" className="hover:underline">トップ</a>
          <a href="/link" className="hover:underline">日程登録</a>
          <a href="/personal" className="hover:underline">個人スケジュール</a>
        </nav>
      </header>

      {/* 入力フォーム */}
      <div className="bg-[#1a1a1a] mt-6 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl mb-4">日程登録</h2>
        <input
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
          type="text"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 範囲選択 / 複数選択 */}
        <div className="mb-3">
          <label className="mr-4">
            <input
              type="radio"
              name="rangeMode"
              value="range"
              checked={rangeMode === "range"}
              onChange={(e) => setRangeMode(e.target.value)}
            />{" "}
            範囲選択
          </label>
          <label>
            <input
              type="radio"
              name="rangeMode"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={(e) => setRangeMode(e.target.value)}
            />{" "}
            複数選択
          </label>
        </div>

        {/* カレンダー */}
        <Calendar
          onChange={rangeMode === "range" ? handleDateChange : undefined}
          onClickDay={rangeMode === "multiple" ? handleDateChange : undefined}
          value={rangeMode === "range" ? dates : null}
          selectRange={rangeMode === "range"}
          className="mb-4 rounded-lg shadow-md"
        />

        {/* 時間帯選択 */}
        <select
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
        >
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          {Array.from({ length: 24 }).map((_, i) => (
            <option key={i} value={`${i}:00-${(i + 1) % 24}:00`}>
              {i}:00 - {(i + 1) % 24}:00
            </option>
          ))}
        </select>

        <button
          onClick={handleRegister}
          className="w-full bg-[#FDB9C8] text-black font-bold py-2 px-4 rounded-2xl shadow hover:bg-pink-400 mb-2"
        >
          登録
        </button>
        <button
          onClick={handleShare}
          className="w-full bg-[#004CA0] text-white font-bold py-2 px-4 rounded-2xl shadow hover:bg-blue-700"
        >
          共有リンク発行
        </button>

        {shareUrl && (
          <div className="mt-3 p-3 bg-gray-700 rounded">
            共有リンク:{" "}
            <a href={shareUrl} className="text-[#FDB9C8] underline">
              {shareUrl}
            </a>
          </div>
        )}
      </div>

      {/* 登録済みスケジュール一覧 */}
      <div className="bg-[#1a1a1a] mt-6 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl mb-4">登録済みスケジュール</h2>
        <ul className="space-y-2">
          {schedules.map((s) => (
            <li key={s.id} className="p-3 bg-gray-800 rounded">
              <strong>{s.title}</strong>  
              <br />
              {s.date} - {s.timeslot} [{s.range_mode}]
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
