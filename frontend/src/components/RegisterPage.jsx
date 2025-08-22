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
  const [rangeStart, setRangeStart] = useState(null);
  const [dateOptions, setDateOptions] = useState({});

  // 日付トグル（追加・解除）
  const toggleDate = (date) => {
    const exists = selectedDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
    let newDates;
    let updatedOptions = { ...dateOptions };

    if (exists) {
      newDates = selectedDates.filter(
        (d) => d.toDateString() !== date.toDateString()
      );
      delete updatedOptions[date.toDateString()];
    } else {
      newDates = [...selectedDates, date];
      updatedOptions[date.toDateString()] = {
        type: "allday",
        start: 1,
        end: 2,
      };
    }

    setSelectedDates(newDates);
    setDateOptions(updatedOptions);
  };

  // 範囲クリック選択
  const handleDayClick = (date) => {
    const exists = selectedDates.some(
      (d) => d.toDateString() === date.toDateString()
    );

    // ✅ 選択済みなら解除
    if (exists) {
      toggleDate(date);
      return;
    }

    if (mode === "multi") {
      toggleDate(date);
    } else if (mode === "range") {
      if (!rangeStart) {
        // 範囲開始
        setRangeStart(date);
      } else {
        // 範囲終了 → 開始と終了の間を選択
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;

        let days = [];
        let current = new Date(start);
        current.setHours(0, 0, 0, 0);
        const last = new Date(end);
        last.setHours(0, 0, 0, 0);

        while (current <= last) {
          days.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }

        let newDates = [...selectedDates];
        let updatedOptions = { ...dateOptions };

        days.forEach((d) => {
          if (!newDates.some((s) => s.toDateString() === d.toDateString())) {
            newDates.push(d);
            updatedOptions[d.toDateString()] = {
              type: "allday",
              start: 1,
              end: 2,
            };
          }
        });

        setSelectedDates(newDates);
        setDateOptions(updatedOptions);
        setRangeStart(null); // 範囲選択リセット
      }
    }
  };

  const dayPropGetter = (date) => {
    const isSelected = selectedDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
    if (isSelected) {
      return { className: "selected-day" };
    }
    return {};
  };

  const hours = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <div className="page-card">
      <h2>📅 日程登録</h2>

      {/* モード切替 */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="radio"
            value="multi"
            checked={mode === "multi"}
            onChange={() => {
              setMode("multi");
              setRangeStart(null);
            }}
          />
          複数選択
        </label>
        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => {
              setMode("range");
              setRangeStart(null);
            }}
          />
          範囲選択
        </label>
      </div>

      <Calendar
        localizer={localizer}
        views={["month"]}
        style={{ height: 500 }}
        dayPropGetter={dayPropGetter}
        onDrillDown={(date) => handleDayClick(date)}
      />

      {/* 選択結果 */}
      <div style={{ marginTop: "1rem" }}>
        <h3>選択された日程</h3>
        <ul>
          {selectedDates.map((d) => {
            const key = d.toDateString();
            const opt = dateOptions[key] || {};
            return (
              <li
                key={key}
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ minWidth: "180px" }}>
                  {format(d, "yyyy/MM/dd (E)", { locale: ja })}
                </span>

                {/* 区分プルダウン */}
                <select
                  value={opt.type}
                  onChange={(e) =>
                    setDateOptions((prev) => ({
                      ...prev,
                      [key]: { ...prev[key], type: e.target.value },
                    }))
                  }
                  style={{ marginLeft: "1rem" }}
                >
                  <option value="allday">終日</option>
                  <option value="day">昼</option>
                  <option value="night">夜</option>
                  <option value="time">時間指定</option>
                </select>

                {/* 時間指定時の開始・終了 */}
                {opt.type === "time" && (
                  <span style={{ marginLeft: "1rem" }}>
                    <select
                      value={opt.start}
                      onChange={(e) =>
                        setDateOptions((prev) => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            start: Number(e.target.value),
                          },
                        }))
                      }
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}時
                        </option>
                      ))}
                    </select>
                    ～
                    <select
                      value={opt.end}
                      onChange={(e) =>
                        setDateOptions((prev) => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            end: Number(e.target.value),
                          },
                        }))
                      }
                    >
                      {hours
                        .filter((h) => h > opt.start)
                        .map((h) => (
                          <option key={h} value={h}>
                            {h}時
                          </option>
                        ))}
                    </select>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <button style={{ marginTop: "1rem" }}>登録する</button>
    </div>
  );
};

export default RegisterPage;
