// frontend/src/components/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import ja from "date-fns/locale/ja";
import Holidays from "date-holidays";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../index.css";

// === date-fns ローカライザ ===
const locales = { ja: ja };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const RegisterPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [holidays, setHolidays] = useState({});
  const [loadedYears, setLoadedYears] = useState(new Set());

  const hd = new Holidays("JP"); // 日本の祝日

  // ===== 指定した年の祝日をロード =====
  const loadHolidaysForYear = (year) => {
    if (loadedYears.has(year)) return; // 既にロード済みならスキップ

    const holidayList = hd.getHolidays(year);
    setHolidays((prev) => {
      const newMap = { ...prev };
      holidayList.forEach((h) => {
        const dateStr = format(new Date(h.date), "yyyy-MM-dd");
        newMap[dateStr] = h.name;
      });
      return newMap;
    });

    setLoadedYears((prev) => new Set([...prev, year]));
  };

  // 初期ロード（今年＋前年＋翌年）
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    loadHolidaysForYear(currentYear - 1);
    loadHolidaysForYear(currentYear);
    loadHolidaysForYear(currentYear + 1);
  }, []);

  // ===== 日付セルのスタイル付与 =====
  const dayPropGetter = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");

    if (holidays[dateStr]) {
      return {
        className: "holiday",
        "data-holiday": holidays[dateStr],
      };
    }

    if (selectedDates.includes(dateStr)) {
      return { className: "selected-day" };
    }

    return {};
  };

  // ===== 日付クリックで選択/解除 =====
  const handleSelectSlot = ({ start }) => {
    const dateStr = format(start, "yyyy-MM-dd");
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  // ===== ビューが変わったら祝日をロード =====
  const handleRangeChange = (range) => {
    let year;
    if (Array.isArray(range)) {
      year = range[0] ? new Date(range[0]).getFullYear() : new Date().getFullYear();
    } else {
      year = new Date(range.start).getFullYear();
    }
    loadHolidaysForYear(year);
  };

  return (
    <div className="page-card">
      <h2>日程登録</h2>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        style={{ height: 500 }}
        dayPropGetter={dayPropGetter}
        onSelectSlot={handleSelectSlot}
        onRangeChange={handleRangeChange} // ← ここで動的に祝日取得
      />

      {/* 選択した日程一覧 */}
      {selectedDates.length > 0 && (
        <div className="form-group" style={{ marginTop: "1rem" }}>
          <label>選択された日程:</label>
          <ul>
            {selectedDates.map((date) => (
              <li key={date}>
                {date}
                {holidays[date] ? ` （${holidays[date]}）` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button style={{ marginTop: "1rem" }}>登録する</button>
    </div>
  );
};

export default RegisterPage;
