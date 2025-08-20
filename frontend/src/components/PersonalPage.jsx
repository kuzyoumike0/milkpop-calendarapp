import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("range");
  const [timeslot, setTimeslot] = useState("all");
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    axios.get("/api/holidays").then((res) => setHolidays(res.data));
  }, []);

  const holidayDates = holidays.map((h) => h.date);

  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      setDates(value);
    } else {
      setDates((prev) =>
        prev.some((d) => d.getTime() === value.getTime())
          ? prev.filter((d) => d.getTime() !== value.getTime())
          : [...prev, value]
      );
    }
  };

  const handleSubmit = async () => {
    const formattedDates =
      rangeMode === "range"
        ? Array.from(
            { length: (dates[1] - dates[0]) / (1000 * 60 * 60 * 24) + 1 },
            (_, i) => {
              const d = new Date(dates[0]);
              d.setDate(d.getDate() + i);
              return d.toISOString().split("T")[0];
            }
          )
        : dates.map((d) => d.toISOString().split("T")[0]);

    await axios.post("/api/personal", {
      title,
      memo,
      range_mode: rangeMode,
      dates: formattedDates,
      timeslot,
    });
    alert("保存しました！");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#FDB9C8]">個人日程登録</h2>
      <input
        className="w-full mb-3 p-2 text-black rounded"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full mb-3 p-2 text-black rounded"
        placeholder="メモを入力"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      {/* モード切替 */}
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            value="range"
            checked={rangeMode === "range"}
            onChange={(e) => setRangeMode(e.target.value)}
          />
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={rangeMode === "multiple"}
            onChange={(e) => setRangeMode(e.target.value)}
          />
          複数選択
        </label>
      </div>

      {/* カレンダー */}
      <Calendar
        onChange={handleDateChange}
        selectRange={rangeMode === "range"}
        value={dates}
        tileClassName={({ date }) =>
          holidayDates.includes(date.toISOString().split("T")[0])
            ? "text-red-500 font-bold"
            : ""
        }
      />

      {/* 時間帯 */}
      <div className="mt-4">
        <select
          className="w-full p-2 text-black rounded"
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
        >
          <option value="all">終日</option>
          <option value="day">昼</option>
          <option value="night">夜</option>
          <option value="custom">開始〜終了を指定</option>
        </select>
      </div>

      <button
        className="mt-6 w-full bg-[#004CA0] text-white py-2 rounded-2xl hover:bg-[#FDB9C8] hover:text-black"
        onClick={handleSubmit}
      >
        保存
      </button>
    </div>
  );
}
