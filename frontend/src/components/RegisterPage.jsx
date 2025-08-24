import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Holidays from "date-holidays";
import "../index.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [timeRanges, setTimeRanges] = useState({});
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");

  // 月の日数
  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // 日付クリック処理
  const handleDateClick = (date) => {
    if (selectionMode === "single") {
      setSelectedDates([date]);
    } else if (selectionMode === "multiple") {
      setSelectedDates((prev) =>
        prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
      );
    } else if (selectionMode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = new Date(selectedDates[0]);
        const end = new Date(date);
        if (end < start) {
          [start, end] = [end, start];
        }
        const range = [];
        const cur = new Date(start);
        while (cur <= end) {
          range.push(cur.toISOString().split("T")[0]);
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(range);
      } else {
        setSelectedDates([date]);
      }
    }
  };

  // 月移動
  const prevMonth = () => {
    setCurrentMonth((prev) =>
      prev === 0 ? 11 : prev - 1
    );
    if (currentMonth === 0) setCurrentYear(currentYear - 1);
  };
  const nextMonth = () => {
    setCurrentMonth((prev) =>
      prev === 11 ? 0 : prev + 1
    );
    if (currentMonth === 11) setCurrentYear(currentYear + 1);
  };

  // 共有リンク発行
  const handleShare = async () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          dates: selectedDates,
          options: { timeRanges },
        }),
      });
      const data = await res.json();
      if (data.share_token) {
        navigate(`/share/${data.share_token}`);
      } else {
        alert("共有リンクの生成に失敗しました");
      }
    } catch (err) {
      console.error(err);
      alert("サーバーエラー");
    }
  };

  return (
    <div className="page-container">
      <h2 className="text-xl font-bold mb-4">日程登録ページ</h2>
      <div className="mb-2">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 rounded w-64"
        />
      </div>

      {/* 選択モード */}
      <div className="mb-4">
        <label>
          <input
            type="radio"
            value="single"
            checked={selectionMode === "single"}
            onChange={() => setSelectionMode("single")}
          />
          単日
        </label>
        <label className="ml-4">
          <input
            type="radio"
            value="multiple"
            checked={selectionMode === "multiple"}
            onChange={() => setSelectionMode("multiple")}
          />
          複数選択
        </label>
        <label className="ml-4">
          <input
            type="radio"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => setSelectionMode("range")}
          />
          範囲
        </label>
      </div>

      {/* カレンダー */}
      <div className="calendar">
        <div className="flex justify-between mb-2">
          <button onClick={prevMonth}>←</button>
          <span>{currentYear}年 {currentMonth + 1}月</span>
          <button onClick={nextMonth}>→</button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
            <div key={d} className="font-bold text-center">{d}</div>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty-${idx}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, idx) => {
            const date = new Date(currentYear, currentMonth, idx + 1);
            const dateStr = date.toISOString().split("T")[0];
            const isSelected = selectedDates.includes(dateStr);
            const holiday = hd.isHoliday(date);

            return (
              <div
                key={dateStr}
                onClick={() => handleDateClick(dateStr)}
                className={`p-2 text-center rounded cursor-pointer ${
                  isSelected ? "bg-pink-400" : "bg-gray-200"
                }`}
              >
                {idx + 1}
                {holiday && <div className="text-red-500 text-xs">{holiday.name}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 発行ボタン */}
      <button
        onClick={handleShare}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        共有リンクを発行
      </button>
    </div>
  );
};

export default RegisterPage;
