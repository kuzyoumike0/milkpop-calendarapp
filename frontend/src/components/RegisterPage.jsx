import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "react-calendar/dist/Calendar.css"; // 標準CSS必須
import "../register.css";

const RegisterPage = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("multiple");
  const [rangeStart, setRangeStart] = useState(null);

  const hd = new Holidays("JP");

  // JST変換
  const getJSTDate = (date) => {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utc + 9 * 60 * 60000);
  };

  // 日付クリック
  const handleDateClick = (date) => {
    const jstDate = getJSTDate(date);

    if (mode === "range") {
      if (!rangeStart) {
        setRangeStart(jstDate);
      } else {
        const start = rangeStart < jstDate ? rangeStart : jstDate;
        const end = rangeStart < jstDate ? jstDate : rangeStart;
        const newRange = [];
        let current = new Date(start);
        while (current <= end) {
          newRange.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(newRange);
        setRangeStart(null);
      }
    } else {
      const exists = selectedDates.find(
        (d) => d.toDateString() === jstDate.toDateString()
      );
      if (exists) {
        setSelectedDates(
          selectedDates.filter((d) => d.toDateString() !== jstDate.toDateString())
        );
      } else {
        setSelectedDates([...selectedDates, jstDate]);
      }
    }
  };

  return (
    <div className="register-page">
      <h2 className="page-title">日程登録ページ</h2>

      {/* モード切替 */}
      <div className="mode-select">
        <label>
          <input
            type="radio"
            name="mode"
            value="multiple"
            checked={mode === "multiple"}
            onChange={() => {
              setMode("multiple");
              setSelectedDates([]);
              setRangeStart(null);
            }}
          />
          <span>複数選択</span>
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="range"
            checked={mode === "range"}
            onChange={() => {
              setMode("range");
              setSelectedDates([]);
              setRangeStart(null);
            }}
          />
          <span>範囲選択</span>
        </label>
      </div>

      {/* カレンダー */}
      <Calendar
        locale="ja-JP"
        calendarType="iso8601"   // ✅ 正しい指定
        firstDayOfWeek={1}       // ✅ 月曜始まり
        formatShortWeekday={(locale, date) =>
          ["日", "月", "火", "水", "木", "金", "土"][date.getDay()]
        }
        onClickDay={(date) => handleDateClick(date)}
        tileClassName={({ date }) => {
          const jstDate = getJSTDate(date);
          const today = getJSTDate(new Date());

          const isToday = jstDate.toDateString() === today.toDateString();
          const isSunday = jstDate.getDay() === 0;
          const isSaturday = jstDate.getDay() === 6;
          const holiday = hd.isHoliday(jstDate);

          if (isToday) return "day-today";
          if (
            selectedDates.some(
              (d) => d.toDateString() === jstDate.toDateString()
            )
          )
            return "selected-date";
          if (holiday || isSunday) return "day-sunday";
          if (isSaturday) return "day-saturday";
          return "day-default";
        }}
      />
    </div>
  );
};

export default RegisterPage;
