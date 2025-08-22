// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import SelectMode from "./SelectMode";
import { useNavigate } from "react-router-dom";
import Holidays from "date-holidays";   // ✅ 祝日判定ライブラリ追加
import "../index.css";

// 日本の祝日データ
const hd = new Holidays("JP");

const RegisterPage = () => {
  const [mode, setMode] = useState("range"); // "range" | "multi"
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState(""); // ✅ タイトル入力欄を追加

  const [timeOptions] = useState([...Array(24).keys()].map(h => `${h}:00`));
  const [endTimeOptions] = useState([...Array(24).keys()].map(h => `${h}:00`).concat("24:00"));
  const [dateOptions, setDateOptions] = useState({});

  const navigate = useNavigate();

  // 日付クリック処理
  const handleDateClick = (date) => {
    const dateStr = date.toDateString();
    if (mode === "multi") {
      // 複数選択
      if (selectedDates.some(d => d.toDateString() === dateStr)) {
        setSelectedDates(selectedDates.filter(d => d.toDateString() !== dateStr));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else {
      // 範囲選択
      setSelectedDates([date]);
    }
  };

  // カレンダーの祝日・土日判定
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday) return "holiday";   // ✅ 祝日
      if (date.getDay() === 0) return "sunday";   // ✅ 日曜
      if (date.getDay() === 6) return "saturday"; // ✅ 土曜
    }
    return null;
  };

  // 保存処理
  const handleSave = async () => {
    if (!title.trim()) {
      alert("タイトルを入力してください");
      return;
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,                // ✅ タイトルを送信
          dates: selectedDates.map(d => d.toISOString()),
          options: dateOptions,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        alert("登録しました！共有リンクをコピーして他の人に送れます");
        navigate(`/share/${data.shareId}`);
      }
    } catch (err) {
      console.error("❌ 登録エラー:", err);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録ページ</h2>

      {/* ✅ タイトル入力 */}
      <div className="mb-4">
        <label>
          タイトル：
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：打ち合わせ、飲み会、イベント名"
            className="p-2 border rounded w-full text-black"
          />
        </label>
      </div>

      {/* カレンダー */}
      <div className="register-layout">
        <div className="calendar-section">
          <Calendar
            onClickDay={handleDateClick}
            selectRange={mode === "range"}
            value={selectedDates}
            tileClassName={tileClassName}   // ✅ 祝日対応
          />
          <SelectMode mode={mode} setMode={setMode} />
        </div>

        {/* 日程リスト */}
        <div className="schedule-section">
          <h3>選択した日程</h3>
          {selectedDates.map((d, i) => (
            <div key={i} className="schedule-item">
              {d.toLocaleDateString()}
            </div>
          ))}
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="mt-6 text-center">
        <button className="fancy-btn" onClick={handleSave}>
          登録して共有リンクを発行
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
