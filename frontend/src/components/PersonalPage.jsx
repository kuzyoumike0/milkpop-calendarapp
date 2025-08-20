import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("range");
  const [timeMode, setTimeMode] = useState("preset"); // "preset" or "custom"
  const [preset, setPreset] = useState("all"); // "all", "day", "night"
  const [startTime, setStartTime] = useState("01:00");
  const [endTime, setEndTime] = useState("24:00");
  const [holidays, setHolidays] = useState([]);
  const [list, setList] = useState([]);

  useEffect(() => {
    axios.get("/api/holidays").then((res) => setHolidays(res.data));
    fetchList();
  }, []);

  const fetchList = async () => {
    const res = await axios.get("/api/personal");
    setList(res.data);
  };

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

  const timeOptions = Array.from({ length: 24 }, (_, i) =>
    `${String((i + 1) % 24).padStart(2, "0")}:00`
  );

  const handleSubmit = async () => {
    let s = startTime;
    let e = endTime;

    if (timeMode === "preset") {
      if (preset === "all") {
        s = "01:00";
        e = "24:00";
      } else if (preset === "day") {
        s = "09:00";
        e = "18:00";
      } else if (preset === "night") {
        s = "18:00";
        e = "24:00";
      }
    }

    if (s >= e) {
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

    await axios.post("/api/personal", {
      title,
      memo,
      range_mode: rangeMode,
      dates: formattedDates,
      start_time: s,
      end_time: e,
    });

    fetchList();
    alert("保存しました！");
  };

  const getTimeLabel = (s, e) => {
    if (s === "01:00" && e === "24:00") return "終日";
    if (s === "09:00" && e === "18:00") return "昼";
    if (s === "18:00" && e === "24:00") return "夜";
    return `${s} 〜 ${e}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-2">
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

      {/* 時間選択 */}
      <div className="mt-6">
        <label className="block mb-2 text-[#FDB9C8]">時間指定モード</label>
        <select
          className="w-full p-2 text-black rounded mb-4"
          value={timeMode}
          onChange={(e) => setTimeMode(e.target.value)}
        >
          <option value="preset">プリセット（終日・昼・夜）</option>
          <option value="custom">カスタム（開始〜終了）</option>
        </select>

        {timeMode === "preset" ? (
          <select
            className="w-full p-2 text-black rounded"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
          >
            <option value="all">終日</option>
            <option value="day">昼 (09:00〜18:00)</option>
            <option value="night">夜 (18:00〜24:00)</option>
          </select>
        ) : (
          <div className="grid grid-cols-2 gap-4">
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
        )}
      </div>

      <button
        className="mt-6 w-full bg-[#FDB9C8] text-black py-2 rounded-2xl hover:bg-[#004CA0] hover:text-white shadow-lg"
        onClick={handleSubmit}
      >
        保存
      </button>

      {/* 保存済み一覧 */}
      <h3 className="text-xl font-bold mt-10 mb-4 text-[#FDB9C8]">
        保存した個人スケジュール
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-gray-900 rounded-2xl shadow-lg border border-gray-700 flex flex-col justify-between"
          >
            <h4 className="text-lg font-semibold text-[#FDB9C8] mb-2 truncate">
              {item.title}
            </h4>
            {item.memo && (
              <p className="text-sm text-gray-300 mb-2 line-clamp-3">
                {item.memo}
              </p>
            )}
            <p className="text-gray-400 text-sm mb-1">
              <span className="font-semibold text-white">日付:</span>{" "}
              {item.dates.join(", ")}
            </p>
            <p className="text-gray-400 text-sm">
              <span className="font-semibold text-white">時間帯:</span>{" "}
              {getTimeLabel(item.start_time, item.end_time)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
