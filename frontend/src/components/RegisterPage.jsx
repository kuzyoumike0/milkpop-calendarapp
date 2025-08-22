// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import ja from "date-fns/locale/ja";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../index.css";

const locales = { ja };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const RegisterPage = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("multi"); // multi / range

  // クリックまたは範囲選択
  const handleSelectSlot = ({ start, end }) => {
    if (mode === "multi") {
      // 複数選択 → クリックした日を追加
      const day = new Date(start);
      if (
        !selectedDates.some(
          (d) => d.toDateString() === day.toDateString()
        )
      ) {
        setSelectedDates([...selectedDates, day]);
      }
    } else if (mode === "range") {
      // 範囲選択 → start ~ end の日付をすべて追加
      let days = [];
      let current = new Date(start);
      current.setHours(0, 0, 0, 0);
      const last = new Date(end);
      last.setHours(0, 0, 0, 0);

      while (current <= last) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      setSelectedDates(days);
    }
  };

  // 選択済みセルをハイライト
  const dayPropGetter = (date) => {
    const isSelected = selectedDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
    if (isSelected) {
      return { className: "selected-day" };
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
