// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Holidays from "date-holidays";
import "../index.css";
import Dropdown from "./Dropdown";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [timeRanges, setTimeRanges] = useState({});
  const [shareLink, setShareLink] = useState("");
  const navigate = useNavigate();

  const jstNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );
  const [currentMonth, setCurrentMonth] = useState(jstNow.getMonth());
  const [currentYear, setCurrentYear] = useState(jstNow.getFullYear());
  const hd = new Holidays("JP");

  // ...（handleDateClick, getDisplayedDates, renderDays などはそのまま）...

  // 📌 共有リンク発行
  const generateShareLink = async () => {
    const displayedDates = getDisplayedDates();
    if (!title || displayedDates.length === 0) {
      alert("タイトルと日程を入力してください！");
      return;
    }
    const body = { title, dates: displayedDates, timeRanges };
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || ""}/api/schedules`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (data.share_token) {
        const url = `${window.location.origin}/share/${data.share_token}`;
        setShareLink(url);
      }
    } catch (err) {
      console.error("共有リンク発行エラー:", err);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録</h2>

      {/* タイトル入力 */}
      <div className="input-card">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />

        {/* 複数選択 / 範囲選択ラジオ */}
        <div className="radio-group">
          <label
            className={`radio-label ${
              selectionMode === "multiple" ? "active" : ""
            }`}
          >
            <input
              type="radio"
              value="multiple"
              checked={selectionMode === "multiple"}
              onChange={() => setSelectionMode("multiple")}
            />
            複数選択
          </label>
          <label
            className={`radio-label ${
              selectionMode === "range" ? "active" : ""
            }`}
          >
            <input
              type="radio"
              value="range"
              checked={selectionMode === "range"}
              onChange={() => setSelectionMode("range")}
            />
            範囲選択
          </label>
        </div>

        {/* ✅ 現在のモードを明示 */}
        <div className="mt-2 text-sm text-gray-200">
          現在のモード:{" "}
          <span className="font-bold text-yellow-300">
            {selectionMode === "multiple" ? "複数選択" : "範囲選択"}
          </span>
        </div>
      </div>

      {/* カレンダー + 選択リスト */}
      <div className="main-layout">
        <div className="calendar-section">
          <div className="calendar">
            <div className="calendar-header">
              <button onClick={() => setCurrentMonth(currentMonth - 1)}>←</button>
              <h3>
                {currentYear}年 {currentMonth + 1}月
              </h3>
              <button onClick={() => setCurrentMonth(currentMonth + 1)}>→</button>
            </div>
            <div className="calendar-grid">{renderDays()}</div>
          </div>
        </div>

        <div className="options-section">
          <h3>選択した日程</h3>
          <ul>
            {getDisplayedDates().map((d, i) => (
              <li key={i} className="selected-date">
                {d}
                <Dropdown
                  value={timeRanges[d]?.type || "allday"}
                  onChange={(val) => handleTimeChange(d, val)}
                />
                {timeRanges[d]?.type === "custom" && (
                  <span className="custom-time">
                    <select
                      className="custom-dropdown"
                      value={timeRanges[d]?.start || "00:00"}
                      onChange={(e) =>
                        handleCustomTimeChange(d, "start", e.target.value)
                      }
                    >
                      {generateTimeOptions().map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    〜
                    <select
                      className="custom-dropdown"
                      value={timeRanges[d]?.end || "01:00"}
                      onChange={(e) =>
                        handleCustomTimeChange(d, "end", e.target.value)
                      }
                    >
                      {generateTimeOptions().map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 共有リンク発行 */}
      <button onClick={generateShareLink} className="share-button fancy">
        🔗 共有リンク発行
      </button>

      {shareLink && (
        <div className="share-link">
          <p>共有リンク:</p>
          <a href={shareLink} className="underline text-blue-200">
            {shareLink}
          </a>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
