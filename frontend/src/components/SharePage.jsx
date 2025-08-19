import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SharePage() {
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple"); // multiple / range
  const [category, setCategory] = useState("終日");
  const [startTime, setStartTime] = useState("01:00");
  const [endTime, setEndTime] = useState("00:00");
  const [shareUrl, setShareUrl] = useState("");
  const navigate = useNavigate();

  // 日付フォーマット
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // カレンダー選択
  const handleDateChange = (value) => {
    if (selectionMode === "range") {
      const [start, end] = value;
      if (start && end) {
        const dates = [];
        let current = new Date(start);
        while (current <= end) {
          dates.push(formatDate(new Date(current)));
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(dates);
      }
    } else {
      // multiple mode
      const dateStr = formatDate(value);
      setSelectedDates((prev) =>
        prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
      );
    }
  };

  // 共有リンク発行
  const createShareLink = async () => {
    if (selectedDates.length === 0) {
      alert("日程を選択してください");
      return;
    }
    try {
      const res = await axios.post("/api/sharelink", {
        dates: selectedDates,
        category,
        startTime: category === "時間帯" ? startTime : null,
        endTime: category === "時間帯" ? endTime : null,
        username: "guest",
      });
      const url = `${window.location.origin}/share/${res.data.linkId}`;
      setShareUrl(url);
    } catch (err) {
      console.error(err);
      alert("共有リンクの発行に失敗しました");
    }
  };

  // 時刻プルダウン（1時〜0時）
  const renderTimeOptions = () => {
    const times = [];
    for (let h = 1; h <= 24; h++) {
      const label = `${String(h % 24).padStart(2, "0")}:00`;
      times.push(<option key={label} value={label}>{label}</option>);
    }
    return times;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">予定を共有する</h2>

      {/* 選択モード */}
      <div className="mb-4">
        <label>
          <input
            type="radio"
            name="mode"
            value="multiple"
            checked={selectionMode === "multiple"}
            onChange={() => setSelectionMode("multiple")}
          /> 複数日選択
        </label>
        <label className="ml-4">
          <input
            type="radio"
            name="mode"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => setSelectionMode("range")}
          /> 範囲選択
        </label>
      </div>

      {/* カレンダー */}
      <Calendar
        selectRange={selectionMode === "range"}
        onChange={handleDateChange}
      />
      <p className="mt-2">選択日: {selectedDates.join(", ")}</p>

      {/* 区分 */}
      <div className="mt-4">
        <label>
          <input
            type="radio"
            name="category"
            value="終日"
            checked={category === "終日"}
            onChange={() => setCategory("終日")}
          /> 終日
        </label>
        <label className="ml-4">
          <input
            type="radio"
            name="category"
            value="昼"
            checked={category === "昼"}
            onChange={() => setCategory("昼")}
          /> 昼（13:00〜18:00）
        </label>
        <label className="ml-4">
          <input
            type="radio"
            name="category"
            value="夜"
            checked={category === "夜"}
            onChange={() => setCategory("夜")}
          /> 夜（21:00〜00:00）
        </label>
        <label className="ml-4">
          <input
            type="radio"
            name="category"
            value="時間帯"
            checked={category === "時間帯"}
            onChange={() => setCategory("時間帯")}
          /> 時間帯指定
        </label>
      </div>

      {/* 時間帯プルダウン */}
      {category === "時間帯" && (
        <div className="mt-2 flex gap-4">
          <div>
            開始時刻:
            <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
              {renderTimeOptions()}
            </select>
          </div>
          <div>
            終了時刻:
            <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
              {renderTimeOptions()}
            </select>
          </div>
        </div>
      )}

      {/* 共有リンク発行 */}
      <button
        onClick={createShareLink}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        共有リンクを発行
      </button>

      {/* URL 表示 */}
      {shareUrl && (
        <div className="mt-4">
          <p>共有リンク:</p>
          <a href={shareUrl} className="text-blue-600 underline" target="_blank" rel="noreferrer">
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
}
