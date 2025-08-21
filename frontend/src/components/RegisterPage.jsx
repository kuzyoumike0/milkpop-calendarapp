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

  // ===== 日本の祝日を取得（前年〜+9年後 = 11年分） =====
  useEffect(() => {
    const hd = new Holidays("JP"); // 日本の祝日
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let y = currentYear - 1; y <= currentYear + 9; y++) {
      years.push(y);
    }

    const holidayMap = {};

    years.forEach((year) => {
      const holidayList = hd.getHolidays(year);
      holidayList.forEach((h) => {
        const dateStr = format(new Date(h.date), "yyyy-MM-dd");
        holidayMap[dateStr] = h.name; // 例: "2025-08-11": "山の日"
      });
    });

    setHolidays(holidayMap);
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
