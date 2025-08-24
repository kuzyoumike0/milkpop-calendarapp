// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Holidays from "date-holidays";
import "../index.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

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
        let start = new Date(selectedDates[0]);
        let end = new Date(date);
        if (end < start) [start, end] = [end, start];
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

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleShare = async () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dates: selectedDates, options: {} }),
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
    <div className="page-container p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">日程登録ページ</h2>

      {/* 入力フォーム */}
      <div className="bg-white/90 shadow-lg rounded-2xl p-4 mb-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 border rounded w-full mb-2"
        />

        {/* ラジオボタン */}
        <div className="flex justify-center space-x-4 mb-2">
          <label>
            <input
              type="radio"
              value="single"
              checked={selectionMode === "single"}
              onChange={() => setSelectionMode("single")}
            />
            単日
          </label>
          <label>
            <input
              type="radio"
              value="multiple"
              checked={selectionMode === "multiple"}
              onChange={() => setSelectionMode("multiple")}
            />
            複数
          </label>
          <label>
            <input
              type="radio"
              value="range"
              checked={selectionMode === "range"}
              onChange={() => setSelectionMode("range")}
            />
            範囲
          </label>
        </div>
      </div>

      {/* 横並びレイアウト */}
      <div className="flex gap-6">
        {/* 左：カレンダー */}
        <div className="flex-grow bg-white/90 shadow-lg rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <button onClick={prevMonth} className="px-2">←</button>
            <span className="font-bold">{currentYear}年 {currentMonth + 1}月</span>
            <button onClick={nextMonth} className="px-2">→</button>
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
                    isSelected ? "bg-pink-400 text-white" : "bg-gray-100"
                  }`}
                >
                  {idx + 1}
                  {holiday && (
                    <div className="text-red-500 text-xs">{holiday.name}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 右：選択リスト */}
        <div className="w-1/3 bg-white/90 shadow-lg rounded-2xl p-4">
          <h3 className="font-bold mb-2">選択した日程</h3>
          <ul className="list-disc pl-5">
            {selectedDates.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ボタン */}
      <div className="mt-6 text-center">
        <button
          onClick={handleShare}
          className="bg-gradient-to-r from-pink-400 to-blue-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:opacity-90"
        >
          共有リンクを発行
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
