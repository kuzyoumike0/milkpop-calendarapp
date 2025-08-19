import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple"); // multiple / range
  const [mode, setMode] = useState("fixed"); // fixed = 終日/昼/夜, custom = 時間帯指定
  const [fixedCategory, setFixedCategory] = useState("終日");
  const [startTime, setStartTime] = useState("01:00");
  const [endTime, setEndTime] = useState("00:00");
  const [shareUrl, setShareUrl] = useState("");

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
      const [start, end] = value || [];
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
      const dateStr = formatDate(value);
      setSelectedDates((prev) =>
        prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
      );
    }
  };

  // 時刻プルダウン
  const renderTimeOptions = () => {
    const times = [];
    for (let h = 1; h <= 24; h++) {
      const label = `${String(h % 24).padStart(2, "0")}:00`;
      times.push(<option key={label} value={label}>{label}</option>);
    }
    return times;
  };

  // 共有リンク発行
  const createShareLink = async () => {
    if (selectedDates.length === 0) {
      alert("日程を選択してください");
      return;
    }
    try {
      const payload = {
        dates: selectedDates,
        category: mode === "fixed" ? fixedCategory : "時間帯",
        startTime: mode === "custom" ? startTime : null,
        endTime: mode === "custom" ? endTime : null,
        username: "guest",
      };
      console.log("送信データ:", payload);

      const res = await axios.post("/api/sharelink", payload);
      const url = `${window.location.origin}/share/${res.data.linkId}`;
      setShareUrl(url);
    } catch (err) {
      console.error("共有リンク作成失敗:", err);
      alert("共有リンクの発行に失敗しました");
    }
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
          /> 複数日選択（クリックで複数日）
        </label>
        <label className="ml-4">
          <input
            type="radio"
            name="mode"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => setSelectionMode("range")}
          /> 範囲選択（ドラッグで範囲）
        </label>
      </div>

      {/* カレンダー */}
      <Calendar
        selectRange={selectionMode === "range"}
        onChange={handleDateChange}
      />
      <p className="mt-2">選択日: {selectedDates.join(", ")}</p>

      {/* 区分モード */}
      <div className="mt-4">
        <label>
          <input
            type="radio"
            name="categoryMode"
            value="fixed"
            checked={mode === "fixed"}
            onChange={() => setMode("fixed")}
          /> 終日/昼/夜 を選択
        </label>
        <label className="ml-4">
          <input
            type="radio"
            name="categoryMode"
            value="custom"
            checked={mode === "custom"}
            onChange={() => setMode("custom")}
          /> 時間帯指定
        </label>
      </div>

      {/* 固定区分プルダウン */}
      {mode === "fixed" && (
        <div className="mt-2">
          <select value={fixedCategory} onChange={(e) => setFixedCategory(e.target.value)}>
            <option value="終日">終日</option>
            <option value="昼">昼（13:00〜18:00）</option>
            <option value="夜">夜（21:00〜00:00）</option>
          </select>
        </div>
      )}

      {/* 時間帯指定 */}
      {mode === "custom" && (
        <div className="mt-2 flex gap-4">
          <div>
            開始:
            <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
              {renderTimeOptions()}
            </select>
          </div>
          <div>
            終了:
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
