import React, { useState } from "react";
import "../index.css";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day) => {
    const date = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter((d) => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-6 text-white font-sans">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6 tracking-wide drop-shadow-lg">
        日程登録ページ
      </h1>

      <div className="flex w-full max-w-6xl gap-6">
        {/* カレンダー部分 */}
        <div className="w-2/3 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl shadow-xl border border-yellow-700 p-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="イベントのタイトルを入力"
            className="w-full mb-4 px-4 py-2 rounded-lg bg-black text-white border border-yellow-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
          />

          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-500 transition"
            >
              &lt;
            </button>
            <h2 className="text-xl font-bold text-yellow-400">
              {currentYear}年 {currentMonth + 1}月
            </h2>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-500 transition"
            >
              &gt;
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center font-semibold text-yellow-400">
            {daysOfWeek.map((day, i) => (
              <div key={i}>{day}</div>
            ))}
          </div>

          {/* 日付セル */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {Array(startDay)
              .fill(null)
              .map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const date = `${currentYear}-${String(currentMonth + 1).padStart(
                2,
                "0"
              )}-${String(day).padStart(2, "0")}`;
              const isSelected = selectedDates.includes(date);

              return (
                <div
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`cursor-pointer rounded-lg py-2 font-medium transition transform ${
                    isSelected
                      ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-bold shadow-lg scale-105"
                      : "bg-[#1a1a1a] border border-yellow-700 hover:bg-yellow-700 hover:text-black hover:scale-105"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* 選択した日程リスト */}
        <div className="w-1/3 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-2xl shadow-xl border border-yellow-700 p-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">選択した日程</h2>
          {selectedDates.length === 0 ? (
            <p className="text-gray-400">まだ日程が選択されていません</p>
          ) : (
            <ul className="space-y-2">
              {selectedDates.map((date, idx) => (
                <li
                  key={idx}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-black px-4 py-2 rounded-lg shadow-md font-semibold"
                >
                  {date}
                </li>
              ))}
            </ul>
          )}
          <button className="mt-6 w-full bg-yellow-500 text-black font-bold py-2 rounded-lg hover:bg-yellow-400 transition shadow-lg">
            共有リンクを発行
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
