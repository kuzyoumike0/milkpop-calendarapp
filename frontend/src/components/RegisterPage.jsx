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
  const [dateOptions, setDateOptions] = useState({}); // 日付ごとの区分データ

  // クリックまたは範囲選択
  const handleSelectSlot = ({ start, end }) => {
    let newDates = [];

    if (mode === "multi") {
      const day = new Date(start);
      if (
        !selectedDates.some((d) => d.toDateString() === day.toDateString())
      ) {
        newDates = [...selectedDates, day];
      } else {
        newDates = [...selectedDates];
      }
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
      newDates = days;
    }

    setSelectedDates(newDates);

    // 初期値を設定
    const updatedOptions = { ...dateOptions };
    newDates.forEach((d) => {
      const key = d.toDateString();
      if (!updatedOptions[key]) {
        updatedOptions[key] = {
          type: "allday", // 終日 / 昼 / 夜 / time
          start: 1,
          end: 2,
        };
      }
    });
    setDateOptions(updatedOptions);
  };

  // 日付ごとの設定変更
  const handleOptionChange = (dateKey, field, value) => {
    setDateOptions((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [field]: value,
      },
    }));
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

  // 時刻のプルダウンリスト
  const hours = Array.from({ length: 24 }, (_, i) => i + 1);

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
          {selectedDates.map((d, i) => {
            const key = d.toDateString();
            const opt = dateOptions[key] || {};
            return (
              <li key={i} style={{ marginBottom: "1rem" }}>
                {format(d, "yyyy/MM/dd (E)", { locale: ja })}

                {/* 区分プルダウン */}
                <select
                  value={opt.type}
                  onChange={(e) =>
                    handleOptionChange(key, "type", e.target.value)
                  }
                  style={{ marginLeft: "1rem" }}
                >
                  <option value="allday">終日</option>
                  <option value="day">昼</option>
                  <option value="night">夜</option>
                  <option value="time">時間指定</option>
                </select>

                {/* 時間指定のときのみ開始・終了プルダウン表示 */}
                {opt.type === "time" && (
                  <span style={{ marginLeft: "1rem" }}>
                    <select
                      value={opt.start}
                      onChange={(e) =>
                        handleOptionChange(key, "start", Number(e.target.value))
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
                        handleOptionChange(key, "end", Number(e.target.value))
                      }
                    >
                      {hours
                        .filter((h) => h > opt.start) // 終了時刻は開始より後
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

      {/* 登録ボタン */}
      <button style={{ marginTop: "1rem" }}>登録する</button>
    </div>
  );
};

export default RegisterPage;
