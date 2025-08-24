import React, { useState } from "react";
import { Link } from "react-router-dom";

// ==== ヘルパー ====
// 月ごとの日数を取得（うるう年対応）
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// ==== カレンダーセル ==== 
const CalendarCell = ({ date, isSelected, onClick }) => {
  return (
    <div
      onClick={() => onClick(date)}
      className={`w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition 
        ${isSelected ? "bg-[#FDB9C8] text-white font-bold" : "hover:bg-[#004CA0] hover:text-white"}`}
    >
      {date.getDate()}
    </div>
  );
};

export default function RegisterPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [title, setTitle] = useState("");
  const [selectionType, setSelectionType] = useState("multiple"); // 複数 or 範囲
  const [selectedDates, setSelectedDates] = useState([]);
  const [range, setRange] = useState({ start: null, end: null });

  // ==== 日付クリック処理 ====
  const handleDateClick = (date) => {
    if (selectionType === "multiple") {
      setSelectedDates((prev) =>
        prev.some((d) => d.getTime() === date.getTime())
          ? prev.filter((d) => d.getTime() !== date.getTime())
          : [...prev, date]
      );
    } else if (selectionType === "range") {
      if (!range.start || (range.start && range.end)) {
        setRange({ start: date, end: null });
      } else if (range.start && !range.end) {
        if (date < range.start) {
          setRange({ start: date, end: range.start });
        } else {
          setRange({ ...range, end: date });
        }
      }
    }
  };

  // ==== 選択状態確認 ====
  const isDateSelected = (date) => {
    if (selectionType === "multiple") {
      return selectedDates.some((d) => d.getTime() === date.getTime());
    } else if (selectionType === "range") {
      if (range.start && range.end) {
        return date >= range.start && date <= range.end;
      }
      return range.start && date.getTime() === range.start.getTime();
    }
    return false;
  };

  // ==== カレンダー生成 ====
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(currentYear, currentMonth, d));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload =
      selectionType === "multiple"
        ? { title, dates: selectedDates }
        : { title, range };

    console.log("登録データ:", payload);
    alert("登録しました！");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#FDB9C8] to-[#004CA0] text-white">
      {/* ==== バナー ==== */}
      <header className="w-full bg-black bg-opacity-70 py-4 px-6 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
        <nav className="space-x-4">
          <Link to="/" className="hover:underline">トップ</Link>
          <Link to="/personal" className="hover:underline">個人スケジュール</Link>
        </nav>
      </header>

      {/* ==== メインカード ==== */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl p-6">
        <div className="bg-black bg-opacity-50 rounded-2xl shadow-xl p-6 w-full">
          <h2 className="text-xl font-semibold mb-4 text-center">日程登録</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* タイトル入力 */}
            <input
              type="text"
              placeholder="タイトルを入力"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-black"
            />

            {/* ラジオボタン */}
            <div className="flex space-x-6 items-center">
              <label>
                <input
                  type="radio"
                  value="multiple"
                  checked={selectionType === "multiple"}
                  onChange={(e) => setSelectionType(e.target.value)}
                />
                複数選択
              </label>
              <label>
                <input
                  type="radio"
                  value="range"
                  checked={selectionType === "range"}
                  onChange={(e) => setSelectionType(e.target.value)}
                />
                範囲選択
              </label>
            </div>

            {/* ==== カレンダー ==== */}
            <div className="bg-white text-black rounded-xl p-4 shadow-md">
              {/* 月切替 */}
              <div className="flex justify-between items-center mb-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentMonth((prev) =>
                      prev === 0 ? 11 : prev - 1
                    ) || (prev === 0 && setCurrentYear(currentYear - 1))
                  }
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  ←
                </button>
                <h3 className="font-bold">
                  {currentYear}年 {currentMonth + 1}月
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentMonth((prev) =>
                      prev === 11 ? 0 : prev + 1
                    ) || (prev === 11 && setCurrentYear(currentYear + 1))
                  }
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  →
                </button>
              </div>

              {/* 曜日 */}
              <div className="grid grid-cols-7 gap-1 font-semibold text-center">
                {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* 日付セル */}
              <div className="grid grid-cols-7 gap-1 mt-2">
                {calendarDays.map((date, i) =>
                  date ? (
                    <CalendarCell
                      key={i}
                      date={date}
                      isSelected={isDateSelected(date)}
                      onClick={handleDateClick}
                    />
                  ) : (
                    <div key={i} className="w-10 h-10"></div>
                  )
                )}
              </div>
            </div>

            {/* 登録ボタン */}
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-[#FDB9C8] hover:bg-[#e89cab] text-black font-bold"
            >
              登録する
            </button>
          </form>
        </div>
      </main>

      {/* ==== フッター ==== */}
      <footer className="w-full py-4 bg-black bg-opacity-70 text-center text-sm">
        © 2025 MilkPOP Calendar
      </footer>
    </div>
  );
}
