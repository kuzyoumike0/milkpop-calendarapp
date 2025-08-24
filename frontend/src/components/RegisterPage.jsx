import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Holidays from "date-holidays";

// ==== ヘルパー ====
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// ==== カレンダーセル ====
const CalendarCell = ({ date, isSelected, onClick, isHoliday, holidayName, isSaturday }) => {
  let textColor = "";
  if (isHoliday) {
    textColor = "text-red-500 font-bold"; // 祝日優先
  } else if (isSaturday) {
    textColor = "text-blue-500 font-bold";
  }

  return (
    <div
      onClick={() => onClick(date)}
      title={holidayName || ""}
      className={`w-14 h-14 flex flex-col items-center justify-center rounded-lg cursor-pointer transition
        ${isSelected ? "bg-[#FDB9C8] text-white font-bold" : ""}
        ${textColor}
        ${!isSelected && !isHoliday && !isSaturday ? "hover:bg-[#004CA0] hover:text-white" : ""}`}
    >
      <span>{date.getDate()}</span>
      {holidayName && (
        <span className="text-[0.6rem] text-red-500 font-normal leading-tight">
          {holidayName}
        </span>
      )}
    </div>
  );
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [title, setTitle] = useState("");
  const [selectionType, setSelectionType] = useState("multiple");
  const [selectedDates, setSelectedDates] = useState([]);
  const [range, setRange] = useState({ start: null, end: null });
  const [holidays, setHolidays] = useState([]); // {date, name}

  const [timeType, setTimeType] = useState("allday");
  const [timeRange, setTimeRange] = useState({ start: "09:00", end: "18:00" });

  // ==== 日本の祝日を取得 ====
  useEffect(() => {
    const hd = new Holidays("JP");
    const yearHolidays = hd.getHolidays(currentYear).map((h) => ({
      date: new Date(h.date),
      name: h.name,
    }));
    setHolidays(yearHolidays);
  }, [currentYear]);

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

  const getHolidayInfo = (date) => {
    const holiday = holidays.find(
      (h) =>
        h.date.getFullYear() === date.getFullYear() &&
        h.date.getMonth() === date.getMonth() &&
        h.date.getDate() === date.getDate()
    );
    return holiday ? holiday.name : null;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(currentYear, currentMonth, d));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const scheduleId = uuidv4();
    const payload =
      selectionType === "multiple"
        ? { id: scheduleId, title, dates: selectedDates, timeType, timeRange }
        : { id: scheduleId, title, range, timeType, timeRange };

    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    navigate(`/share/${scheduleId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#FDB9C8] to-[#004CA0] text-white">
      <header className="w-full bg-black bg-opacity-70 py-4 px-6 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl p-6">
        <div className="bg-black bg-opacity-50 rounded-2xl shadow-xl p-6 w-full">
          <h2 className="text-xl font-semibold mb-4 text-center">日程登録</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* タイトル */}
            <input
              type="text"
              placeholder="タイトルを入力"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-black"
            />

            {/* 複数 / 範囲選択 */}
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
              <div className="flex justify-between items-center mb-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentMonth((prev) => {
                      if (prev === 0) {
                        setCurrentYear((y) => y - 1);
                        return 11;
                      }
                      return prev - 1;
                    })
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
                    setCurrentMonth((prev) => {
                      if (prev === 11) {
                        setCurrentYear((y) => y + 1);
                        return 0;
                      }
                      return prev + 1;
                    })
                  }
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 font-semibold text-center">
                {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 mt-2">
                {calendarDays.map((date, i) =>
                  date ? (
                    <CalendarCell
                      key={i}
                      date={date}
                      isSelected={isDateSelected(date)}
                      onClick={handleDateClick}
                      isHoliday={!!getHolidayInfo(date)}
                      holidayName={getHolidayInfo(date)}
                      isSaturday={date.getDay() === 6} // 土曜日を判定
                    />
                  ) : (
                    <div key={i} className="w-14 h-14"></div>
                  )
                )}
              </div>
            </div>

            {/* ==== 時間帯 ==== */}
            <div className="bg-white text-black rounded-xl p-4 shadow-md space-y-2">
              <p className="font-semibold">時間帯を選択してください:</p>
              <div className="flex flex-col space-y-1">
                <label>
                  <input
                    type="radio"
                    value="allday"
                    checked={timeType === "allday"}
                    onChange={(e) => setTimeType(e.target.value)}
                  />
                  全日
                </label>
                <label>
                  <input
                    type="radio"
                    value="daytime"
                    checked={timeType === "daytime"}
                    onChange={(e) => setTimeType(e.target.value)}
                  />
                  昼（09:00〜18:00）
                </label>
                <label>
                  <input
                    type="radio"
                    value="night"
                    checked={timeType === "night"}
                    onChange={(e) => setTimeType(e.target.value)}
                  />
                  夜（18:00〜23:59）
                </label>
                <label>
                  <input
                    type="radio"
                    value="custom"
                    checked={timeType === "custom"}
                    onChange={(e) => setTimeType(e.target.value)}
                  />
                  時刻指定
                </label>
              </div>

              {timeType === "custom" && (
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="time"
                    value={timeRange.start}
                    onChange={(e) =>
                      setTimeRange({ ...timeRange, start: e.target.value })
                    }
                    className="border rounded px-2 py-1"
                  />
                  <span>〜</span>
                  <input
                    type="time"
                    value={timeRange.end}
                    onChange={(e) =>
                      setTimeRange({ ...timeRange, end: e.target.value })
                    }
                    className="border rounded px-2 py-1"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-[#FDB9C8] hover:bg-[#e89cab] text-black font-bold"
            >
              共有リンクを発行
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
