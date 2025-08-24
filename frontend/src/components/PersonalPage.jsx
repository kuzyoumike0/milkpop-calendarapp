import React, { useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../index.css";

const PersonalPage = () => {
  const [shareId, setShareId] = useState("");
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [timeRanges, setTimeRanges] = useState({});
  const [personalList, setPersonalList] = useState([]);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");

  // 月の日数
  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // 日付クリック
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
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (currentMonth === 0) setCurrentYear(currentYear - 1);
  };
  const nextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (currentMonth === 11) setCurrentYear(currentYear + 1);
  };

  // 保存処理
  const handleSave = async () => {
    if (!shareId || !title || selectedDates.length === 0) {
      alert("共有ID・タイトル・日程は必須です");
      return;
    }
    try {
      const res = await fetch("/api/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          share_id: shareId,
          title,
          memo,
          dates: selectedDates,
          options: { timeRanges },
        }),
      });
      const data = await res.json();
      setPersonalList((prev) => [...prev, data]);

      // 入力クリア
      setTitle("");
      setMemo("");
      setSelectedDates([]);
      setTimeRanges({});
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="page-container">
      <h2 className="text-xl font-bold mb-4">個人日程登録ページ</h2>

      <div className="mb-2">
        <input
          type="text"
          placeholder="共有スケジュールID (share_id)"
          value={shareId}
          onChange={(e) => setShareId(e.target.value)}
          className="p-2 rounded w-80 mb-2"
        />
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 rounded w-64 mb-2"
        />
        <textarea
          placeholder="メモ"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="p-2 rounded w-80 mb-2"
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
          複数
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
          <span>
            {currentYear}年 {currentMonth + 1}月
          </span>
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
                {holiday && (
                  <div className="text-red-500 text-xs">{holiday.name}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        個人日程を保存
      </button>

      {/* 保存済みリスト */}
      <h3 className="text-lg font-bold mt-6 mb-2">保存済み個人スケジュール</h3>
      <ul className="list-disc pl-6">
        {personalList.map((p) => (
          <li key={p.id}>
            <strong>{p.title}</strong> ({p.dates.join(", ")}) - {p.memo}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PersonalPage;
