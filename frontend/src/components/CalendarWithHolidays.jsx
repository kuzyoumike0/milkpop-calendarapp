import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// 日本の祝日リスト（サンプル）
const holidays = {
  "2025-01-01": "元日",
  "2025-01-13": "成人の日",
  "2025-02-11": "建国記念の日",
  "2025-02-23": "天皇誕生日",
  "2025-03-20": "春分の日",
  // 必要に応じて追加
};

function CalendarWithHolidays() {
  const [value, setValue] = useState(new Date());

  return (
    <div className="flex flex-col items-center mt-12">
      <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] bg-clip-text text-transparent mb-6 drop-shadow-md">
        祝日対応カレンダー
      </h2>

      <div className="bg-black/60 border border-[#FDB9C8]/30 rounded-2xl p-6 shadow-lg backdrop-blur-md">
        <Calendar
          onChange={setValue}
          value={value}
          locale="ja-JP"
          tileClassName={({ date }) => {
            const dateStr = date.toISOString().split("T")[0];
            if (holidays[dateStr]) {
              return "holiday-tile";
            }
          }}
        />
      </div>

      <p className="mt-4 text-gray-300">
        選択日:{" "}
        <span className="text-[#FDB9C8] font-semibold">
          {value.toLocaleDateString("ja-JP")}
        </span>
      </p>
    </div>
  );
}

export default CalendarWithHolidays;
