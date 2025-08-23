// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import "../index.css";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const dateString = clickedDate.toISOString().split("T")[0];

    if (selectedDates.includes(dateString)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateString));
    } else {
      setSelectedDates([...selectedDates, dateString]);
    }
  };

  const renderCalendar = () => {
    const weeks = [];
    let days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-4"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = new Date(currentYear, currentMonth, day)
        .toISOString()
        .split("T")[0];
      const isSelected = selectedDates.includes(dateString);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`p-4 text-center rounded-2xl cursor-pointer transition ${
            isSelected
              ? "bg-[#FDB9C8] text-white shadow-lg scale-105"
              : "hover:bg-pink-100 hover:scale-105"
          }`}
        >
          {day}
        </div>
      );

      if ((day + firstDay) % 7 === 0 || day === daysInMonth) {
        weeks.push(
          <div key={`week-${day}`} className="grid grid-cols-7 gap-2">
            {days}
          </div>
        );
        days = [];
      }
    }
    return weeks;
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#004CA0]">
        日程登録ページ
      </h2>

      {/* カレンダー */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="px-4 py-2 bg-[#FDB9C8] text-white rounded-xl shadow hover:bg-pink-400 transition"
          >
            ＜
          </button>
          <span className="text-xl font-semibold">
            {currentYear}年 {currentMonth + 1}月
          </span>
          <button
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="px-4 py-2 bg-[#FDB9C8] text-white rounded-xl shadow hover:bg-pink-400 transition"
          >
            ＞
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-2 font-semibold text-gray-700 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center">
              {day}
            </div>
          ))}
        </div>

        {/* カレンダー本体 */}
        <div className="space-y-2">{renderCalendar()}</div>
      </div>

      {/* 選択した日程リスト */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-3">選択した日程:</h3>
        {selectedDates.length > 0 ? (
          <ul className="list-disc pl-6 space-y-1">
            {selectedDates.map((date) => (
              <li key={date}>{date}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">まだ日程が選択されていません</p>
        )}
      </div>
    </main>
  );
};

export default RegisterPage;
