import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import useHolidays from "../hooks/useHolidays";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [mode, setMode] = useState("range"); // カレンダー選択モード
  const [timeType, setTimeType] = useState("終日"); // 時間指定タイプ
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("01:00");
  const [schedules, setSchedules] = useState([]);
  const [link, setLink] = useState("");

  const holidays = useHolidays();

  const fetchSchedules = async () => {
    const res = await axios.get("/api/personal");
    setSchedules(res.data);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // カレンダー選択処理
  const handleDateChange = (value) => {
    if (mode === "range") {
      setDates(value);
    } else {
      if (!Array.isArray(dates)) setDates([]);
      const exists = dates.find((d) => d.toDateString() === value.toDateString());
      if (exists) {
        setDates(dates.filter((d) => d.toDateString() !== value.toDateString()));
      } else {
        setDates([...dates, value]);
      }
    }
  };

  // 時刻リスト
  const timeOptions = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, "0")}:00`
  );

  // 保存処理
  const handleSave = async () => {
    // 日付整形
    const formattedDates = Array.isArray(dates)
      ? dates.map((d) => {
          if (d instanceof Date) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
          }
          return d;
        })
      : [];

    // 時間バリデーション
    let timeslot = timeType;
    if (timeType === "時間指定") {
      if (startTime >= endTime) {
        alert("終了時刻は開始時刻より後にしてください");
        return;
      }
      timeslot = `${startTime}〜${endTime}`;
    }

    // API送信
    const res = await axios.post("/api/schedules", {
      title,
      dates: formattedDates,
      timeslot,
    });

    setLink(res.data.link);
    fetchSchedules();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">日程登録</h2>

      <input
        className="p-2 mb-2 w-full text-black rounded"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* カレンダー選択モード切替 */}
      <div className="mb-2">
        <label className="mr-4">
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />{" "}
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            value="multi"
            checked={mode === "multi"}
            onChange={() => setMode("multi")}
          />{" "}
          複数選択
        </label>
      </div>

      {/* カレンダー */}
      <Calendar
        onChange={handleDateChange}
        value={dates}
        selectRange={mode === "range"}
        tileClassName={({ date }) => {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          const key = `${yyyy}-${mm}-${dd}`;
          return holidays[key] ? "text-red-500 font-bold" : "";
        }}
      />

      {/* 時間帯プルダウン */}
      <div className="mt-4">
        <label className="mr-4">
          <select
            className="text-black p-2 rounded"
            value={timeType}
            onChange={(e) => setTimeType(e.target.value)}
          >
            <option value="終日">終日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
            <option value="時間指定">時間指定</option>
          </select>
        </label>

        {timeType === "時間指定" && (
          <div className="mt-2 space-x-2">
            <select
              className="text-black p-2 rounded"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <span>〜</span>
            <select
              className="text-black p-2 rounded"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        className="mt-4 bg-[#004CA0] hover:bg-[#FDB9C8] text-white px-4 py-2 rounded-xl"
      >
        保存して共有リンク発行
      </button>

      {/* 共有リンク表示 */}
      {link && (
        <p className="mt-4">
          共有リンク:{" "}
          <a className="text-blue-400 underline" href={link}>
            {link}
          </a>
        </p>
      )}

      <h3 className="text-xl mt-6">登録済み</h3>
      <ul>
        {schedules.map((s, i) => (
          <li key={i}>
            {s.title} - {s.date} ({s.timeslot})
          </li>
        ))}
      </ul>
    </div>
  );
}
