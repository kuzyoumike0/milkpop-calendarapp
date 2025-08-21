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

// === 祝日リスト ===
const holidays = {
  "2025-08-11": "山の日",
};

const RegisterPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectMode, setSelectMode] = useState("multi"); // multi / range
  const [dateDetails, setDateDetails] = useState({}); // { "2025-08-11": { type: "昼", start:"", end:"" } }

  // === 日付セル装飾 ===
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

  // === 日付選択 ===
  const handleSelectSlot = ({ start }) => {
    const dateStr = format(start, "yyyy-MM-dd");

    if (selectMode === "multi") {
      // 複数選択モード
      if (selectedDates.includes(dateStr)) {
        setSelectedDates(selectedDates.filter((d) => d !== dateStr));
      } else {
        setSelectedDates([...selectedDates, dateStr]);
      }
    } else if (selectMode === "range") {
      // 範囲選択モード
      if (selectedDates.length === 0) {
        setSelectedDates([dateStr]);
      } else {
        const startDate = new Date(selectedDates[0]);
        const endDate = new Date(dateStr);
        let range = [];

        if (startDate <= endDate) {
          for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
            range.push(format(new Date(d), "yyyy-MM-dd"));
          }
        } else {
          for (let d = endDate; d <= startDate; d.setDate(d.getDate() + 1)) {
            range.push(format(new Date(d), "yyyy-MM-dd"));
          }
        }
        setSelectedDates(range);
      }
    }
  };

  // === 区分変更 ===
  const handleTypeChange = (date, value) => {
    setDateDetails({
      ...dateDetails,
      [date]: { ...dateDetails[date], type: value },
    });
  };

  // === 時間帯変更 ===
  const handleTimeChange = (date, field, value) => {
    setDateDetails({
      ...dateDetails,
      [date]: { ...dateDetails[date], [field]: value },
    });
  };

  // 時刻リスト
  const timeOptions = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  return (
    <div className="page-card">
      <h2>日程登録</h2>

      {/* === ラジオボタンで選択モード切替 === */}
      <div className="form-group" style={{ marginBottom: "1rem" }}>
        <label>選択方法:</label>
        <label>
          <input
            type="radio"
            value="multi"
            checked={selectMode === "multi"}
            onChange={(e) => setSelectMode(e.target.value)}
          />
          複数選択
        </label>
        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            value="range"
            checked={selectMode === "range"}
            onChange={(e) => setSelectMode(e.target.value)}
          />
          範囲選択
        </label>
      </div>

      {/* === カレンダー === */}
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

      {/* === 選択された日付 === */}
      {selectedDates.length > 0 && (
        <div className="form-group" style={{ marginTop: "1rem" }}>
          <label>選択された日程:</label>
          <ul>
            {selectedDates.map((date) => (
              <li key={date} style={{ marginBottom: "0.5rem" }}>
                {date}
                <select
                  value={dateDetails[date]?.type || ""}
                  onChange={(e) => handleTypeChange(date, e.target.value)}
                  style={{ marginLeft: "1rem" }}
                >
                  <option value="">区分を選択</option>
                  <option value="終日">終日</option>
                  <option value="昼">昼</option>
                  <option value="夜">夜</option>
                  <option value="時間帯">時間帯</option>
                </select>

                {/* === 時間帯を選んだら開始/終了プルダウン === */}
                {dateDetails[date]?.type === "時間帯" && (
                  <span style={{ marginLeft: "1rem" }}>
                    <select
                      value={dateDetails[date]?.start || ""}
                      onChange={(e) =>
                        handleTimeChange(date, "start", e.target.value)
                      }
                    >
                      <option value="">開始時刻</option>
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <span style={{ margin: "0 0.5rem" }}>〜</span>
                    <select
                      value={dateDetails[date]?.end || ""}
                      onChange={(e) =>
                        handleTimeChange(date, "end", e.target.value)
                      }
                    >
                      <option value="">終了時刻</option>
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </span>
                )}
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
