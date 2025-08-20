import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [selectionMode, setSelectionMode] = useState("multiple"); // multiple or range
  const [dates, setDates] = useState([]);
  const [timeMode, setTimeMode] = useState("all"); // all, day, night, custom
  const [startTime, setStartTime] = useState("01:00");
  const [endTime, setEndTime] = useState("02:00");
  const [link, setLink] = useState("");

  // カレンダー選択
  const handleDateChange = (value) => {
    if (selectionMode === "multiple") {
      setDates((prev) => {
        const already = prev.find(
          (d) => new Date(d).toDateString() === value.toDateString()
        );
        if (already) {
          return prev.filter(
            (d) => new Date(d).toDateString() !== value.toDateString()
          );
        }
        return [...prev, value];
      });
    } else {
      setDates(value);
    }
  };

  // 登録
  const handleSubmit = async () => {
    const formatDate = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const selectedDates =
      selectionMode === "multiple"
        ? dates.map((d) => formatDate(d))
        : [formatDate(dates[0]), formatDate(dates[1])];

    const res = await axios.post("/api/schedules", {
      title,
      dates: selectedDates,
      start_time: timeMode === "custom" ? startTime : timeMode,
      end_time: timeMode === "custom" ? endTime : null,
    });

    setLink(`${window.location.origin}/share/${res.data.linkid}`);
  };

  return (
    <div className="p-6">
      <div className="card">
        <h2 className="card-title">📅 日程登録</h2>

        {/* タイトル */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-300">タイトル</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-800 text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 選択モード */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-300">選択モード</label>
          <div className="flex gap-4 text-white">
            <label>
              <input
                type="radio"
                checked={selectionMode === "multiple"}
                onChange={() => setSelectionMode("multiple")}
              />{" "}
              複数選択
            </label>
            <label>
              <input
                type="radio"
                checked={selectionMode === "range"}
                onChange={() => setSelectionMode("range")}
              />{" "}
              範囲選択
            </label>
          </div>
        </div>

        {/* カレンダー */}
        <div className="mb-4">
          <Calendar
            selectRange={selectionMode === "range"}
            onClickDay={handleDateChange}
            value={dates}
            tileClassName={({ date }) =>
              dates.some &&
              dates.some(
                (d) => new Date(d).toDateString() === date.toDateString()
              )
                ? "bg-brandPink text-black rounded-lg"
                : ""
            }
          />
        </div>

        {/* 時間帯プルダウン */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-300">時間帯</label>
          <select
            className="w-full p-2 rounded bg-gray-800 text-white"
            value={timeMode}
            onChange={(e) => setTimeMode(e.target.value)}
          >
            <option value="all">終日</option>
            <option value="day">昼</option>
            <option value="night">夜</option>
            <option value="custom">時間指定</option>
          </select>
        </div>

        {/* カスタム時間 */}
        {timeMode === "custom" && (
          <div className="flex gap-2 mb-4">
            <select
              className="w-1/2 p-2 rounded bg-gray-800 text-white"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            >
              {Array.from({ length: 24 }, (_, i) => {
                const h = (i + 1) % 24;
                const label = h === 0 ? "0:00" : `${h}:00`;
                return (
                  <option key={h} value={`${String(h).padStart(2, "0")}:00`}>
                    {label}
                  </option>
                );
              })}
            </select>

            <select
              className="w-1/2 p-2 rounded bg-gray-800 text-white"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            >
              {Array.from({ length: 24 }, (_, i) => {
                const h = (i + 1) % 24;
                const label = h === 0 ? "0:00" : `${h}:00`;
                return (
                  <option key={h} value={`${String(h).padStart(2, "0")}:00`}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* 送信ボタン */}
        <button onClick={handleSubmit} className="btn w-full">
          共有リンクを発行
        </button>

        {/* 発行リンク */}
        {link && (
          <div className="mt-4 p-2 bg-gray-800 rounded text-center">
            <a href={link} className="text-brandPink underline">
              {link}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
