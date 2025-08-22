// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays } from "date-fns";
import ja from "date-fns/locale/ja";
import Holidays from "date-holidays";
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

const hd = new Holidays("JP");

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("multiple"); // multiple | range
  const [rangeStart, setRangeStart] = useState(null);

  // クリック時の処理
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
        // 範囲開始
        setRangeStart(date);
      } else {
        // 2回目クリックで範囲生成
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;
        const range = [];
        let current = start;
        while (current <= end) {
          range.push(new Date(current));
          current = addDays(current, 1);
        }
        setSelectedDates(range);
        setRangeStart(null); // 初期化
      }
    }
  };

  // 祝日判定
  const dayPropGetter = (date) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    if (!hd.getHolidays(y)) return {};
    const holiday = hd.getHolidays(y).find(
      (h) =>
        h.date ===
        format(date, "yyyy-MM-dd", { awareOfUnicodeTokens: true })
    );
    const isSelected = selectedDates.some(
      (d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );

    if (holiday && isSelected) {
      return {
        className: "holiday selected-day",
        "data-holiday": holiday.name,
      };
    } else if (holiday) {
      return { className: "holiday", "data-holiday": holiday.name };
    } else if (isSelected) {
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
          placeholder="予定のタイトルを入力"
        />
      </div>

      {/* モード切替 */}
      <div className="form-group">
        <label>選択モード</label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={mode === "multiple"}
            onChange={() => setMode("multiple")}
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
        views={["month"]}
        selectable
        style={{ height: 500 }}
        dayPropGetter={dayPropGetter}
        onSelectSlot={({ start }) => handleDayClick(start)} // ✅ クリックで選択
      />

      {/* 選択された日付 */}
      <div className="form-group">
        <h3>選択された日程</h3>
        {selectedDates.length === 0 ? (
          <p>日付を選択してください</p>
        ) : (
          <ul>
            {selectedDates
              .sort((a, b) => a - b)
              .map((d, idx) => (
                <li key={idx}>
                  {format(d, "yyyy-MM-dd")}
                  <select style={{ marginLeft: "1rem" }}>
                    <option value="allday">終日</option>
                    <option value="day">昼</option>
                    <option value="night">夜</option>
                    <option value="time">時間指定</option>
                  </select>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* 登録ボタン */}
      <button onClick={() => alert("登録しました！")}>登録</button>
    </div>
  );
};

export default RegisterPage;
