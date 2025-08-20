import React, { useState } from "react";
import DatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import DateHolidays from "date-holidays";

export default function CustomCalendar({ value, setValue, mode }) {
  const hd = new DateHolidays("JP"); // 日本の祝日対応

  // 祝日判定
  const highlightHoliday = (date) => {
    const d = new Date(date.year, date.month.number - 1, date.day);
    const holiday = hd.isHoliday(d);
    if (holiday) {
      return {
        style: { backgroundColor: "#FDB9C8", color: "black" },
        title: holiday.name, // hover時に祝日名を表示
      };
    }
    return {};
  };

  return (
    <div className="bg-black text-white p-4 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-2 text-[#FDB9C8]">📅 自作カレンダー</h2>
      <DatePicker
        value={value}
        onChange={setValue}
        multiple={mode === "multiple"}
        range={mode === "range"}
        format="YYYY-MM-DD"
        plugins={[<DatePanel key="panel" />]}
        mapDays={({ date }) => highlightHoliday(date)}
      />
    </div>
  );
}
