// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import ja from "date-fns/locale/ja";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../index.css";

const locales = {
  ja: ja,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const RegisterPage = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("single"); // single / multi / range

  // 日付クリック or 範囲選択
  const handleSelectSlot = ({ start, end }) => {
    if (mode === "single") {
      setSelectedDates([start]);
    } else if (mode === "multi") {
      setSelectedDates((prev) => [...prev, start]);
    } else if (mode === "range") {
      let dates = [];
      let current = new Date(start);
      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      setSelectedDates(dates);
    }
  };

  // 選択された日付をセルに反映
  const dayPropGetter = (date) => {
    const isSelected = selectedDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
    if (isSelected) {
      return {
        className: "selected-day",
      };
    }
    return {};
  };

  return (
    <div className="page-card">
      <h2>📅 日程登録</h2>

      {/* 選択モード切替 */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="radio"
            value="single"
            checked={mode === "single"}
            onChange={() => setMode("single")}
          />
          単日選択
        </label>
        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            value="multi"
            checked={mode === "multi"}
            onChange={() => setMode("multi")}
          />
          複数選択
        </label>
        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          範囲選択
        </label>
      </div>

      {/* カレンダー */}
      <Calendar
        localizer={localizer}
        selectable
        onSelectSlot={handleSelectSlot}
        views={["month"]}
        style={{ height: 500 }}
        dayPropGetter={dayPropGetter}
      />

      {/* 選択結果表示 */}
      <div style={{ marginTop: "1rem" }}>
        <h3>選択された日程</h3>
        <ul>
          {selectedDates.map((d, i) => (
            <li key={i}>{format(d, "yyyy/MM/dd (E)", { locale: ja })}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RegisterPage;
