// frontend/src/components/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";
import Header from "./Header";

const RegisterPage = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("single");
  const [title, setTitle] = useState("");
  const [timeRange, setTimeRange] = useState("終日");
  const [holidays, setHolidays] = useState([]);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    fetch(`/api/holidays/${today.getFullYear()}`)
      .then((res) => res.json())
      .then((data) => setHolidays(data))
      .catch((err) => console.error("Error fetching holidays:", err));
  }, []);

  const isHoliday = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return holidays.some((h) => h.date.startsWith(dateStr));
  };

  const handleDateChange = (date) => {
    if (selectionMode === "single") {
      setSelectedDates([date]);
    } else if (selectionMode === "multiple") {
      const exists = selectedDates.some(
        (d) => d.toDateString() === date.toDateString()
      );
      if (exists) {
        setSelectedDates(selectedDates.filter((d) => d.toDateString() !== date.toDateString()));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else if (selectionMode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0] < date ? selectedDates[0] : date;
        const end = selectedDates[0] < date ? date : selectedDates[0];
        const range = [];
        let cur = new Date(start);
        while (cur <= end) {
          range.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(range);
      } else {
        setSelectedDates([date]);
      }
    }
  };

  const saveSchedules = async () => {
    try {
      const formattedDates = selectedDates.map((d) =>
        d.toISOString().split("T")[0]
      );
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dates: formattedDates, timeRange }),
      });
      const data = await res.json();
      if (data.success) {
        // 共有リンク発行
        const shareRes = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduleIds: [data.id] }),
        });
        const shareData = await shareRes.json();
        if (shareData.success) {
          setShareUrl(window.location.origin + shareData.url);
        }
      }
    } catch (err) {
      console.error("Error saving schedule:", err);
    }
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col md:flex-row p-6">
        {/* 左：カレンダー */}
        <div className="md:w-2/3 p-4 bg-white rounded-2xl shadow-lg">
          <div className="flex space-x-4 mb-4">
            <label>
              <input
                type="radio"
                name="mode"
                value="single"
                checked={selectionMode === "single"}
                onChange={() => setSelectionMode("single")}
              /> 単日
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="multiple"
                checked={selectionMode === "multiple"}
                onChange={() => setSelectionMode("multiple")}
              /> 複数
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="range"
                checked={selectionMode === "range"}
                onChange={() => setSelectionMode("range")}
              /> 範囲
            </label>
          </div>

          <Calendar
            onClickDay={handleDateChange}
            value={currentDate}
            tileClassName={({ date }) =>
              isHoliday(date)
                ? "bg-red-200 rounded-xl"
                : ""
            }
          />
        </div>

        {/* 右：選択リスト */}
        <div className="md:w-1/3 p-4 ml-6 bg-white rounded-2xl shadow-lg">
          <h2 className="text-lg font-bold mb-2">選択中の日程</h2>
          <ul className="mb-4">
            {selectedDates.map((d, i) => (
              <li key={i} className="mb-1">
                {d.toLocaleDateString("ja-JP")}
              </li>
            ))}
          </ul>

          <input
            type="text"
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2 mb-3"
          />

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full border rounded p-2 mb-3"
          >
            <option value="終日">終日</option>
            <option value="午前">午前</option>
            <option value="午後">午後</option>
            <option value="夜">夜</option>
            <option value="時刻指定">時刻指定</option>
          </select>

          <button
            onClick={saveSchedules}
            className="w-full bg-pink-400 text-white font-bold py-2 px-4 rounded-xl hover:bg-pink-500"
          >
            共有リンク発行
          </button>

          {shareUrl && (
            <div className="mt-4">
              <p className="text-sm">共有リンク:</p>
              <a
                href={shareUrl}
                className="text-blue-600 underline break-all"
              >
                {shareUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
