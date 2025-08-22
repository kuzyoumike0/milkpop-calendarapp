// frontend/src/components/PersonalPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import "../index.css";

// 日本の祝日データ
const hd = new Holidays("JP");

const PersonalPage = () => {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("multi"); // "multi" or "range"
  const [timeType, setTimeType] = useState("終日");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");

  // TODO: OAuth後に取得したDiscordのユーザーIDを格納
  const userId = "123456789012345678"; // ★ここをログイン後に置き換える

  // ===== カレンダーの祝日・土日判定 =====
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday) return "holiday";   // 祝日
      if (date.getDay() === 0) return "sunday";   // 日曜
      if (date.getDay() === 6) return "saturday"; // 土曜
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

    try {
      const res = await fetch("/api/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId, // ✅ DiscordのIDを送信
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
      if (Array.isArray(val)) {
        setSelectedDates(val);
      }
    } else {
      const dateStr = val.toDateString();
      if (selectedDates.some((d) => d.toDateString() === dateStr)) {
        // 選択解除
        setSelectedDates(selectedDates.filter((d) => d.toDateString() !== dateStr));
      } else {
        setSelectedDates([...selectedDates, val]);
      }
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">個人スケジュール登録</h2>

      {/* ===== タイトル入力 ===== */}
      <div className="mb-4">
        <label>
          タイトル：
          <input
            className="p-2 border rounded w-full text-black"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：出張、通院、友達と遊ぶ"
          />
        </label>
      </div>

      {/* ===== メモ入力 ===== */}
      <div className="mb-4">
        <label>
          メモ：
          <textarea
            className="p-2 border rounded w-full text-black"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="詳細メモを入力"
          />
        </label>
      </div>

      {/* ===== 範囲 or 複数選択 ===== */}
      <div className="mb-4 flex gap-4">
        <label>
          <input
            type="radio"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            checked={mode === "multi"}
            onChange={() => setMode("multi")}
          />
          複数選択
        </label>
      </div>

      {/* ===== カレンダー ===== */}
      <Calendar
        selectRange={mode === "range"}
        onChange={handleDateChange}
        tileClassName={tileClassName}  // ✅ 祝日対応
        locale="ja-JP"
        calendarType="gregory"
        activeStartDate={new Date()}  // ✅ 今日を基準に表示
      />

      {/* ===== 選択済み日付リスト ===== */}
      <div className="mt-4">
        <h3 className="font-bold">選択した日程</h3>
        <ul className="list-disc list-inside">
          {selectedDates.map((d, i) => {
            const holiday = hd.isHoliday(d);
            const holidayName = holiday ? `（${holiday[0].name}）` : "";
            return <li key={i}>{d.toLocaleDateString()} {holidayName}</li>;
          })}
        </ul>
      </div>

      {/* ===== 時間指定 ===== */}
      <div className="mt-4 space-x-4">
        <label>
          <input
            type="radio"
            value="終日"
            checked={timeType === "終日"}
            onChange={() => setTimeType("終日")}
          />
          終日
        </label>
        <label>
          <input
            type="radio"
            value="昼"
            checked={timeType === "昼"}
            onChange={() => setTimeType("昼")}
          />
          昼
        </label>
        <label>
          <input
            type="radio"
            value="夜"
            checked={timeType === "夜"}
            onChange={() => setTimeType("夜")}
          />
          夜
        </label>
        <label>
          <input
            type="radio"
            value="時刻指定"
            checked={timeType === "時刻指定"}
            onChange={() => setTimeType("時刻指定")}
          />
          時刻指定
        </label>
        {timeType === "時刻指定" && (
          <div className="mt-2">
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
            〜
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* ===== 保存ボタン ===== */}
      <div className="mt-6 text-center">
        <button className="fancy-btn" onClick={handleSave}>
          保存
        </button>
      </div>
    </div>
  );
};

export default PersonalPage;
