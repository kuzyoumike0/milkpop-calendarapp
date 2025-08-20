import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("range");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [link, setLink] = useState("");
  const [holidays, setHolidays] = useState([]);

  // 祝日取得
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

  // 時刻リスト (00:00〜23:00, 1時間刻み)
  const timeOptions = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, "0")}:00`
  );

  const handleSubmit = async () => {
    if (startTime >= endTime) {
      alert("終了時刻は開始時刻より後にしてください。");
      return;
    }

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

    const res = await axios.post("/api/schedule", {
      title,
      range_mode: rangeMode,
      dates: formattedDates,
      start_time: startTime,
      end_time: endTime,
    });
    setLink(window.location.origin + res.data.link);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#FDB9C8]">日程登録</h2>
      <input
        className="w-full mb-3 p-2 text-black rounded"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* モード切替 */}
      <div className="mb-4 space-x-6">
        <label>
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

      {/* 開始時刻・終了時刻 */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <label className="block mb-1 text-[#FDB9C8]">開始時刻</label>
          <select
            className="w-full p-2 text-black rounded"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-[#FDB9C8]">終了時刻</label>
          <select
            className="w-full p-2 text-black rounded"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        className="mt-6 w-full bg-[#004CA0] text-white py-2 rounded-2xl hover:bg-[#FDB9C8] hover:text-black shadow-lg"
        onClick={handleSubmit}
      >
        共有リンクを発行
      </button>

      {link && (
        <p className="mt-4">
          発行されたリンク:{" "}
          <a href={link} className="text-[#FDB9C8]">
            {link}
          </a>
        </p>
      )}
    </div>
  );
}
