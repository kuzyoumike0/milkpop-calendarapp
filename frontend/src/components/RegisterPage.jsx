import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import "../register.css";
import { useNavigate } from "react-router-dom";

const hd = new Holidays("JP");

const RegisterPage = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [mode, setMode] = useState("single");
  const [title, setTitle] = useState("");
  const [shareLink, setShareLink] = useState("");
  const navigate = useNavigate();

  // JST基準の今日
  const jstNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );
  const todayStr = jstNow.toISOString().split("T")[0];

  // 日付クリック
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (mode === "single") {
      setSelectedDates([dateStr]);
    } else if (mode === "multiple") {
      if (selectedDates.includes(dateStr)) {
        setSelectedDates(selectedDates.filter((d) => d !== dateStr));
      } else {
        setSelectedDates([...selectedDates, dateStr]);
      }
    } else if (mode === "range") {
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        setSelectedDates([dateStr]);
      } else if (selectedDates.length === 1) {
        const start = new Date(selectedDates[0]);
        const end = date;
        const range = [];
        let cur = new Date(Math.min(start, end));
        const stop = new Date(Math.max(start, end));
        while (cur <= stop) {
          range.push(cur.toISOString().split("T")[0]);
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(range);
      }
    }
  };

  // ボタンの時間区分を選択
  const handleTimeSelect = (date, time) => {
    setSelectedTimes((prev) => ({
      ...prev,
      [date]: { type: time, start: "", end: "" }
    }));
  };

  // 時間指定（プルダウン変更）
  const handleTimeChange = (date, field, value) => {
    setSelectedTimes((prev) => ({
      ...prev,
      [date]: { ...prev[date], [field]: value }
    }));
  };

  // タイルのクラス名
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const classes = [];
      const day = date.getDay();
      if (day === 0) classes.push("sunday");
      if (day === 6) classes.push("saturday");

      const dateStr = date.toISOString().split("T")[0];
      if (dateStr === todayStr) classes.push("today");
      if (selectedDates.includes(dateStr)) classes.push("selected-date");
      return classes;
    }
    return null;
  };

  // タイルの中に祝日名
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      return holiday ? (
        <div className="holiday-name">{holiday[0].name}</div>
      ) : null;
    }
    return null;
  };

  // 共有リンク生成
  const generateShareLink = () => {
    const token = Math.random().toString(36).substring(2, 10);
    const url = `${window.location.origin}/share/${token}`;
    setShareLink(url);

    // データを保存（SharePageで読み込む）
    localStorage.setItem(
      `share-${token}`,
      JSON.stringify({ title, selectedDates, selectedTimes })
    );

    // そのまま共有ページに遷移
    navigate(`/share/${token}`);
  };

  // 時間リスト
  const hours = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, "0")}:00`
  );

  return (
    <div className="register-page">
      <h1 className="page-title">日程登録</h1>
      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="mode-tabs">
        <button
          className={mode === "single" ? "active" : ""}
          onClick={() => setMode("single")}
        >
          単日
        </button>
        <button
          className={mode === "multiple" ? "active" : ""}
          onClick={() => setMode("multiple")}
        >
          複数選択
        </button>
        <button
          className={mode === "range" ? "active" : ""}
          onClick={() => setMode("range")}
        >
          範囲選択
        </button>
      </div>

      <div className="calendar-container">
        <div className="calendar-box">
          <Calendar
            onClickDay={handleDateClick}
            value={null}
            tileClassName={tileClassName}
            tileContent={tileContent}
          />
        </div>

        <div className="selected-list">
          <h3>選択中の日程</h3>
          {selectedDates.map((d) => (
            <div key={d} className="selected-card">
              <span className="date-badge">{d}</span>
              <div className="time-buttons">
                {["終日", "昼", "夜", "時間指定"].map((t) => (
                  <button
                    key={t}
                    className={`time-btn ${
                      selectedTimes[d]?.type === t ? "active" : ""
                    }`}
                    onClick={() => handleTimeSelect(d, t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {selectedTimes[d]?.type === "時間指定" && (
                <div className="time-selects">
                  <select
                    className="cute-select"
                    value={selectedTimes[d]?.start || ""}
                    onChange={(e) =>
                      handleTimeChange(d, "start", e.target.value)
                    }
                  >
                    <option value="">開始</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <span>〜</span>
                  <select
                    className="cute-select"
                    value={selectedTimes[d]?.end || ""}
                    onChange={(e) => handleTimeChange(d, "end", e.target.value)}
                  >
                    <option value="">終了</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button className="save-btn" onClick={generateShareLink}>
        共有リンクを発行
      </button>

      {shareLink && (
        <div className="share-link-box">
          <a href={shareLink} target="_blank" rel="noopener noreferrer">
            {shareLink}
          </a>
          <button className="copy-btn" onClick={() => navigator.clipboard.writeText(shareLink)}>
            📋 コピー
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
