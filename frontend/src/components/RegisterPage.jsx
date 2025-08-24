// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Holidays from "date-holidays";
import { v4 as uuidv4 } from "uuid";
import "../index.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [timeRanges, setTimeRanges] = useState({});
  const [shareLink, setShareLink] = useState("");

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const isHoliday = (date) => {
    const holiday = hd.isHoliday(date);
    return holiday ? holiday[0].name : null;
  };

  const handleDateClick = (day) => {
    const clickedDate = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    if (selectionMode === "multiple") {
      setSelectedDates((prev) =>
        prev.includes(clickedDate)
          ? prev.filter((d) => d !== clickedDate)
          : [...prev, clickedDate]
      );
    } else if (selectionMode === "range") {
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        setSelectedDates([clickedDate]);
      } else if (selectedDates.length === 1) {
        const start = new Date(selectedDates[0]);
        const end = new Date(clickedDate);
        if (end < start) {
          setSelectedDates([clickedDate, selectedDates[0]]);
        } else {
          setSelectedDates([selectedDates[0], clickedDate]);
        }
      }
    }
  };

  const generateShareLink = () => {
    const token = uuidv4();
    const data = {
      token,
      title,
      dates: selectedDates,
      timeRanges,
    };

    localStorage.setItem(`share_${token}`, JSON.stringify(data));
    setShareLink(`${window.location.origin}/share/${token}`);
  };

  const handleTimeChange = (date, value) => {
    setTimeRanges((prev) => ({
      ...prev,
      [date]: value,
    }));
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = String(i).padStart(2, "0");
    return `${hour}:00`;
  });

  const renderCalendar = () => {
    const weeks = [];
    let days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const holidayName = isHoliday(dateObj);
      const isSat = dateObj.getDay() === 6;
      const isSun = dateObj.getDay() === 0;

      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;

      let isSelected = false;
      if (selectionMode === "multiple") {
        isSelected = selectedDates.includes(dateStr);
      } else if (selectionMode === "range" && selectedDates.length === 2) {
        const start = new Date(selectedDates[0]);
        const end = new Date(selectedDates[1]);
        isSelected = dateObj >= start && dateObj <= end;
      } else if (selectionMode === "range" && selectedDates.length === 1) {
        isSelected = selectedDates[0] === dateStr;
      }

      days.push(
        <div
          key={day}
          className={`p-3 text-center rounded-lg shadow cursor-pointer transition ${
            isSelected ? "bg-pink-500 text-white" : "bg-white text-black"
          } ${holidayName ? "text-red-500 font-bold" : ""} ${
            isSat ? "text-blue-500" : ""
          } ${isSun ? "text-red-600" : ""}`}
          onClick={() => handleDateClick(day)}
        >
          <div className="font-semibold">{day}</div>
          {holidayName && (
            <div className="text-[10px] mt-1 text-red-500">{holidayName}</div>
          )}
        </div>
      );

      if ((days.length + firstDayOfMonth) % 7 === 0 || day === daysInMonth) {
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
    <div className="p-6 flex flex-col items-center">
      <div className="bg-white bg-opacity-95 shadow-xl rounded-2xl p-6 w-full max-w-7xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-black">
          📅 日程登録ページ
        </h2>

        {/* タイトル入力 */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded-xl p-3 w-1/3 text-black shadow focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        {/* 選択モード */}
        <div className="flex justify-center gap-8 mb-8">
          <label className="text-black font-medium">
            <input
              type="radio"
              value="multiple"
              checked={selectionMode === "multiple"}
              onChange={(e) => setSelectionMode(e.target.value)}
              className="mr-2"
            />
            複数選択
          </label>
          <label className="text-black font-medium">
            <input
              type="radio"
              value="range"
              checked={selectionMode === "range"}
              onChange={(e) => setSelectionMode(e.target.value)}
              className="mr-2"
            />
            範囲選択
          </label>
        </div>

        {/* カレンダーとリスト */}
        <div className="grid grid-cols-10 gap-8">
          {/* カレンダー */}
          <div className="col-span-7">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() =>
                  setCurrentMonth((prev) =>
                    prev === 0 ? 11 : prev - 1
                  )
                }
                className="px-3 py-1 bg-gray-200 rounded-lg shadow hover:bg-gray-300"
              >
                ←
              </button>
              <h3 className="text-xl font-semibold text-black">
                {currentYear}年 {currentMonth + 1}月
              </h3>
              <button
                onClick={() =>
                  setCurrentMonth((prev) =>
                    prev === 11 ? 0 : prev + 1
                  )
                }
                className="px-3 py-1 bg-gray-200 rounded-lg shadow hover:bg-gray-300"
              >
                →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center font-semibold text-black mb-2">
              <div>日</div>
              <div>月</div>
              <div>火</div>
              <div>水</div>
              <div>木</div>
              <div>金</div>
              <div>土</div>
            </div>
            {renderCalendar()}
          </div>

          {/* 選択リスト */}
          <div className="col-span-3">
            <h3 className="font-bold mb-3 text-black text-lg">✅ 選択中の日程</h3>
            <div className="space-y-3">
              {selectedDates.length > 0 ? (
                selectedDates.map((date) => (
                  <div
                    key={date}
                    className="bg-white rounded-xl p-3 shadow border border-gray-200"
                  >
                    <span className="text-black font-medium">{date}</span>
                    <select
                      value={timeRanges[date] || ""}
                      onChange={(e) => handleTimeChange(date, e.target.value)}
                      className="mt-2 border rounded-lg p-2 text-black w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">時間を指定</option>
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              ) : (
                <p className="text-black italic">日程が選択されていません</p>
              )}
            </div>
          </div>
        </div>

        {/* 共有リンク */}
        <div className="mt-8 text-center">
          <button
            onClick={generateShareLink}
            className="px-8 py-3 bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] text-white text-lg font-bold rounded-2xl shadow-lg hover:opacity-90 transition"
          >
            🔗 共有リンクを発行
          </button>
          {shareLink && (
            <div className="mt-4 flex flex-col items-center">
              <a
                href={shareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline break-all"
              >
                {shareLink}
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(shareLink)}
                className="mt-2 px-4 py-2 bg-gray-200 rounded-lg shadow hover:bg-gray-300"
              >
                コピー
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
