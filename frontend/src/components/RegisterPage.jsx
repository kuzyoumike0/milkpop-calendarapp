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
  const [dateOptions, setDateOptions] = useState({}); // 日付ごとの区分

  // ▼ 日付をトグル選択する（クリックで追加/解除）
  const toggleDate = (date) => {
    const exists = selectedDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
    let newDates;
    if (exists) {
      newDates = selectedDates.filter(
        (d) => d.toDateString() !== date.toDateString()
      );
    } else {
      newDates = [...selectedDates, date];
    }
    setSelectedDates(newDates);

    // optionsを整理
    const updatedOptions = { ...dateOptions };
    if (!exists) {
      updatedOptions[date.toDateString()] = {
        type: "allday",
        start: 1,
        end: 2,
      };
    } else {
      delete updatedOptions[date.toDateString()];
    }
    setDateOptions(updatedOptions);
  };

  // ▼ 範囲選択
  const handleSelectSlot = ({ start, end }) => {
    if (mode === "multi") {
      toggleDate(new Date(start));
    } else if (mode === "range") {
      let days = [];
      let current = new Date(start);
      current.setHours(0, 0, 0, 0);
      const last = new Date(end);
      last.setHours(0, 0, 0, 0);

      while (current <= last) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      // 選択済み → 外す
      const alreadyAllSelected = days.every((d) =>
        selectedDates.some((s) => s.toDateString() === d.toDateString())
      );

      let newDates;
      let updatedOptions = { ...dateOptions };
      if (alreadyAllSelected) {
        // すべて選択済みなら解除
        newDates = selectedDates.filter(
          (s) => !days.some((d) => d.toDateString() === s.toDateString())
        );
        days.forEach((d) => delete updatedOptions[d.toDateString()]);
      } else {
        // 追加
        newDates = [...selectedDates];
        days.forEach((d) => {
          if (
            !newDates.some((s) => s.toDateString() === d.toDateString())
          ) {
            newDates.push(d);
            updatedOptions[d.toDateString()] = {
              type: "allday",
              start: 1,
              end: 2,
            };
          }
        });
      }
      setSelectedDates(newDates);
      setDateOptions(updatedOptions);
    }
  };

  // ▼ 日付セル装飾
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

      <Calendar
        localizer={localizer}
        selectable
        onSelectSlot={handleSelectSlot}
        views={["month"]}
        style={{ height: 500 }}
        dayPropGetter={dayPropGetter}
      />

      {/* 選択結果 */}
      <div style={{ marginTop: "1rem" }}>
        <h3>選択された日程</h3>
        <ul>
          {selectedDates.map((d) => {
            const key = d.toDateString();
            const opt = dateOptions[key] || {};
            return (
              <li key={key} style={{ marginBottom: "1rem" }}>
                {format(d, "yyyy/MM/dd (E)", { locale: ja })}

                {/* 区分 */}
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

                {/* 時間指定の時だけ */}
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
