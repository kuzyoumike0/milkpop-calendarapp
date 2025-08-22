// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays } from "date-fns";
import ja from "date-fns/locale/ja";
import Holidays from "date-holidays";
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

const hd = new Holidays("JP");

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("multiple"); // multiple or range
  const [selectedDates, setSelectedDates] = useState([]);
  const [rangeStart, setRangeStart] = useState(null);

  // 日付クリック処理
  const handleDayClick = (date) => {
    if (mode === "multiple") {
      const exists = selectedDates.find(
        (d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      );
      if (exists) {
        // 再クリックで削除
        setSelectedDates(
          selectedDates.filter(
            (d) => format(d, "yyyy-MM-dd") !== format(date, "yyyy-MM-dd")
          )
        );
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else if (mode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
      } else {
        // 2回目クリック → 範囲選択
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;
        const range = [];
        let current = start;
        while (current <= end) {
          range.push(current);
          current = addDays(current, 1);
        }
        setSelectedDates(range);
        setRangeStart(null);
      }
    }
  };

  // 区分プルダウンの管理
  const [timeSettings, setTimeSettings] = useState({});
  const handleTimeChange = (dateKey, field, value) => {
    setTimeSettings((prev) => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], [field]: value },
    }));
  };

  // 祝日スタイル
  const dayPropGetter = (date) => {
    const holiday = hd.isHoliday(date);
    const isSelected = selectedDates.some(
      (d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
    if (holiday && isSelected) {
      return {
        className: "holiday selected-day",
        "data-holiday": holiday[0].name,
      };
    }
    if (holiday) {
      return {
        className: "holiday",
        "data-holiday": holiday[0].name,
      };
    }
    if (isSelected) {
      return { className: "selected-day" };
    }
    return {};
  };

  return (
    <div className="page-card">
      <h2>日程登録ページ</h2>

      {/* タイトル入力 */}
      <div className="form-group">
        <label>タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトルを入力"
        />
      </div>

      {/* モード切替 */}
      <div className="form-group">
        <label>選択モード</label>
        <label>
          <input
            type="radio"
            name="mode"
            value="multiple"
            checked={mode === "multiple"}
            onChange={() => {
              setMode("multiple");
              setRangeStart(null);
            }}
          />
          複数選択
        </label>
        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            name="mode"
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

      {/* カレンダー */}
      <Calendar
        localizer={localizer}
        views={["month"]}
        selectable
        style={{ height: 500 }}
        dayPropGetter={dayPropGetter}
        onSelectSlot={({ start }) => handleDayClick(start)}
      />

      {/* 選択された日程 + 区分プルダウン */}
      <div className="form-group">
        <h3>選択された日程</h3>
        {selectedDates.length === 0 ? (
          <p>日程が選択されていません</p>
        ) : (
          <ul>
            {selectedDates
              .sort((a, b) => a - b)
              .map((d) => {
                const dateKey = format(d, "yyyy-MM-dd");
                const setting = timeSettings[dateKey] || {};
                return (
                  <li key={dateKey} style={{ marginBottom: "0.8rem" }}>
                    {format(d, "yyyy年MM月dd日 (E)", { locale: ja })}

                    {/* 区分プルダウン */}
                    <select
                      value={setting.type || ""}
                      onChange={(e) =>
                        handleTimeChange(dateKey, "type", e.target.value)
                      }
                      style={{ marginLeft: "1rem" }}
                    >
                      <option value="">区分を選択</option>
                      <option value="all">終日</option>
                      <option value="day">昼</option>
                      <option value="night">夜</option>
                      <option value="custom">時間指定</option>
                    </select>

                    {/* 時間指定用プルダウン */}
                    {setting.type === "custom" && (
                      <span style={{ marginLeft: "1rem" }}>
                        <select
                          value={setting.start || ""}
                          onChange={(e) =>
                            handleTimeChange(dateKey, "start", e.target.value)
                          }
                        >
                          <option value="">開始時刻</option>
                          {Array.from({ length: 24 }).map((_, i) => (
                            <option key={i} value={i}>
                              {i}:00
                            </option>
                          ))}
                        </select>
                        <span style={{ margin: "0 0.5rem" }}>〜</span>
                        <select
                          value={setting.end || ""}
                          onChange={(e) =>
                            handleTimeChange(dateKey, "end", e.target.value)
                          }
                        >
                          <option value="">終了時刻</option>
                          {Array.from({ length: 24 }).map((_, i) => (
                            <option key={i} value={i}>
                              {i}:00
                            </option>
                          ))}
                        </select>
                      </span>
                    )}
                  </li>
                );
              })}
          </ul>
        )}
      </div>

      {/* 登録ボタン */}
      <button onClick={() => alert("登録処理（API連携予定）")}>登録</button>
    </div>
  );
};

export default RegisterPage;
