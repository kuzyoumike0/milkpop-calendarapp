// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import "../index.css";
import Header from "./Header";
import Footer from "./Footer";

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
      days.push(<td key={`empty-${i}`}></td>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = new Date(currentYear, currentMonth, day)
        .toISOString()
        .split("T")[0];
      const isSelected = selectedDates.includes(dateString);

      days.push(
        <td
          key={day}
          className={`p-2 text-center cursor-pointer rounded-lg ${
            isSelected ? "bg-pink-300 text-white" : "hover:bg-pink-100"
          }`}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </td>
      );

      if ((day + firstDay) % 7 === 0 || day === daysInMonth) {
        weeks.push(<tr key={`week-${day}`}>{days}</tr>);
        days = [];
      }
    }
    return weeks;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-center mb-6">日程登録ページ</h2>

        {/* カレンダー */}
        <div className="overflow-x-auto mb-6">
          <div className="flex justify-between mb-2">
            <button
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear(currentYear - 1);
                } else {
                  setCurrentMonth(currentMonth - 1);
                }
              }}
              className="px-3 py-1 bg-pink-300 text-white rounded-lg"
            >
              ＜
            </button>
            <span className="text-lg font-semibold">
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
              className="px-3 py-1 bg-pink-300 text-white rounded-lg"
            >
              ＞
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {daysOfWeek.map((day) => (
                  <th key={day} className="p-2 border">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{renderCalendar()}</tbody>
          </table>
        </div>

        {/* 選択した日程 */}
        <div>
          <h3 className="text-lg font-bold mb-2">選択した日程:</h3>
          {selectedDates.length > 0 ? (
            <ul className="list-disc pl-6">
              {selectedDates.map((date) => (
                <li key={date}>{date}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">まだ日程が選択されていません</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;
