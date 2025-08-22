// frontend/src/components/PersonalPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import "../index.css";

const hd = new Holidays("JP");

const PersonalPage = () => {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("multi");
  const [timeType, setTimeType] = useState("終日");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");

  const userId = "123456789012345678"; // TODO: OAuth後に置き換える

  // 日本時間の今日
  const today = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );

  // ===== 日付色付け =====
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      ) {
        return "today-highlight";
      }
      if (holiday) return "holiday";
      if (date.getDay() === 0) return "sunday";
      if (date.getDay() === 6) return "saturday";
    }
    return null;
  };

  // ===== 祝日名をセルに表示 =====
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday) {
        return (
          <div className="holiday-label">
            {holiday[0].name}
          </div>
        );
      }
    }
    return null;
  };

  // ===== 保存処理 =====
  const handleSave = async () => {
    if (!title.trim()) {
      alert("タイトルを入力してください");
      return;
    }
    if (selectedDates.length === 0) {
      alert("日程を1つ以上選択してください");
      return;
    }
    if (timeType === "時刻指定" && start >= end) {
      alert("開始時刻は終了時刻より前にしてください");
      return;
    }

    try {
      const res = await fetch("/api/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title,
          memo,
          dates: selectedDates.map((d) => d.toISOString()),
          options: { type: timeType, start, end },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        alert("保存しました！");
      } else {
        alert("保存に失敗しました: " + data.error);
      }
    } catch (err) {
      console.error("❌ 保存エラー:", err);
    }
  };

  // ===== 日付選択処理 =====
  const handleDateChange = (val) => {
    if (mode === "range") {
      if (Array.isArray(val)) setSelectedDates(val);
    } else {
      const dateStr = val.toDateString();
      if (selectedDates.some((d) => d.toDateString() === dateStr)) {
        setSelectedDates(selectedDates.filter((d) => d.toDateString() !== dateStr));
      } else {
        setSelectedDates([...selectedDates, val]);
      }
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">個人スケジュール登録</h2>

      {/* ===== タイトル ===== */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">タイトル</label>
        <input
          className="p-2 border rounded w-full text-black"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：出張、通院、友達と遊ぶ"
        />
      </div>

      {/* ===== メモ ===== */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">メモ</label>
        <textarea
          className="p-2 border rounded w-full text-black"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="詳細メモを入力"
        />
      </div>

      {/* ===== 範囲 or 複数選択 ===== */}
      <div className="mb-4 flex gap-4">
        {["range", "multi"].map((m) => (
          <label
            key={m}
            className={`cursor-pointer px-3 py-1 rounded-full border ${
              mode === m ? "bg-[#FDB9C8] text-black" : "bg-white text-gray-700"
            }`}
          >
            <input
              type="radio"
              className="hidden"
              checked={mode === m}
              onChange={() => setMode(m)}
            />
            {m === "range" ? "範囲選択" : "複数選択"}
          </label>
        ))}
      </div>

      {/* ===== カレンダー ===== */}
      <Calendar
        selectRange={mode === "range"}
        onChange={handleDateChange}
        tileClassName={tileClassName}
        tileContent={tileContent}   // ✅ 祝日名を表示
        locale="ja-JP"
        calendarType="gregory"
        activeStartDate={new Date()}
      />

      {/* ===== 選択済み日付 ===== */}
      <div className="mt-4">
        <h3 className="font-bold">選択した日程</h3>
        <ul className="list-disc list-inside">
          {selectedDates.map((d, i) => {
            const holiday = hd.isHoliday(d);
            const holidayName = holiday ? `（${holiday[0].name}）` : "";
            return (
              <li key={i}>
                {d.toLocaleDateString()} {holidayName}
              </li>
            );
          })}
        </ul>
      </div>

      {/* ===== 時間帯指定 ===== */}
      <div className="mt-4 space-y-2">
        {["終日", "午前", "午後", "夜", "時刻指定"].map((t) => (
          <label
            key={t}
            className={`cursor-pointer px-3 py-1 rounded-full border mr-2 ${
              timeType === t ? "bg-[#004CA0] text-white" : "bg-white text-gray-700"
            }`}
          >
            <input
              type="radio"
              value={t}
              className="hidden"
              checked={timeType === t}
              onChange={() => setTimeType(t)}
            />
            {t}
          </label>
        ))}

        {timeType === "時刻指定" && (
          <div className="mt-2 flex gap-2">
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="p-2 border rounded text-black"
            />
            〜
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="p-2 border rounded text-black"
            />
          </div>
        )}
      </div>

      {/* ===== 保存 ===== */}
      <div className="mt-6 text-center">
        <button className="fancy-btn" onClick={handleSave}>
          保存
        </button>
      </div>
    </div>
  );
};

export default PersonalPage;
