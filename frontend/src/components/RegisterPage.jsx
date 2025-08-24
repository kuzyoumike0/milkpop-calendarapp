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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-blue-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-[#004CA0] mb-6">日程登録ページ</h1>

      <div className="flex w-full max-w-6xl gap-6">
        {/* カレンダー部分 */}
        <div className="w-2/3 bg-white rounded-2xl shadow-lg p-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="イベントのタイトルを入力"
            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB9C8] focus:outline-none"
          />

          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1 bg-[#FDB9C8] text-white rounded-lg hover:bg-[#e49aa9] transition"
            >
              &lt;
            </button>
            <h2 className="text-xl font-bold text-[#004CA0]">
              {currentYear}年 {currentMonth + 1}月
            </h2>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 bg-[#FDB9C8] text-white rounded-lg hover:bg-[#e49aa9] transition"
            >
              &gt;
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center font-semibold text-[#004CA0]">
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
                  className={`cursor-pointer rounded-lg py-2 hover:scale-105 transition transform ${
                    isSelected
                      ? "bg-[#FDB9C8] text-white shadow-md"
                      : "bg-gray-100 hover:bg-[#004CA0] hover:text-white"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* 選択した日程リスト */}
        <div className="w-1/3 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#004CA0] mb-4">選択した日程</h2>
          {selectedDates.length === 0 ? (
            <p className="text-gray-500">まだ日程が選択されていません</p>
          ) : (
            <ul className="space-y-2">
              {selectedDates.map((date, idx) => (
                <li
                  key={idx}
                  className="bg-[#FDB9C8] text-white px-4 py-2 rounded-lg shadow-sm"
                >
                  {date}
                </li>
              ))}
            </ul>
          )}
          <button className="mt-6 w-full bg-[#004CA0] text-white py-2 rounded-lg hover:bg-[#003580] transition">
            共有リンクを発行
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
