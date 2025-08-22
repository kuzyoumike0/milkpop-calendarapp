// frontend/src/components/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import "../index.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("range"); // 範囲選択 or 複数選択
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [timeType, setTimeType] = useState("終日"); // 終日/午前/午後/時間指定
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [shareUrl, setShareUrl] = useState(null);
  const [holidays, setHolidays] = useState({});

  // ==== 日本の祝日を取得 ====
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const year = new Date().getFullYear();
        const res = await fetch(
          `https://holidays-jp.github.io/api/v1/${year}/date.json`
        );
        const data = await res.json();
        setHolidays(data);
      } catch (err) {
        console.error("祝日取得エラー:", err);
      }
    };
    fetchHolidays();
  }, []);

  // ==== 自作カレンダー ====
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const todayStr = new Date().toISOString().split("T")[0];

  const buildCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= lastDate; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      cells.push(dateStr);
    }
    return cells;
  };

  const handleClickDate = (dateStr) => {
    if (mode === "multi") {
      if (multiDates.includes(dateStr)) {
        setMultiDates(multiDates.filter((d) => d !== dateStr));
      } else {
        setMultiDates([...multiDates, dateStr]);
      }
    } else {
      if (!range[0] || (range[0] && range[1])) {
        setRange([new Date(dateStr), null]);
      } else {
        setRange([range[0], new Date(dateStr)]);
      }
    }
  };

  const isSelected = (dateStr) => {
    if (mode === "multi") return multiDates.includes(dateStr);
    if (mode === "range" && range[0] && range[1]) {
      const start = range[0];
      const end = range[1];
      const d = new Date(dateStr);
      return d >= start && d <= end;
    }
    if (mode === "range" && range[0] && !range[1]) {
      return dateStr === range[0].toISOString().split("T")[0];
    }
    return false;
  };

  // ==== 保存 ====
  const handleSave = async () => {
    const dates =
      mode === "range"
        ? (() => {
            const [start, end] = range;
            if (!start || !end) return [];
            const arr = [];
            let cur = new Date(start);
            while (cur <= end) {
              arr.push(cur.toISOString().split("T")[0]);
              cur.setDate(cur.getDate() + 1);
            }
            return arr;
          })()
        : multiDates;

    if (!title.trim() || dates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dates, timeType, startTime, endTime }),
      });
      const data = await res.json();
      if (data.success) {
        setShareUrl(data.shareUrl);
      } else {
        alert("保存に失敗しました");
      }
    } catch (err) {
      console.error("保存エラー:", err);
      alert("通信エラーが発生しました");
    }
  };

  const days = buildCalendar();

  return (
    <main className="page-container">
      <h2 className="page-title">日程登録ページ</h2>

      <div className="register-layout">
        {/* 左側：カレンダー */}
        <div className="calendar-section custom-calendar">
          <div className="calendar-header">
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                    1
                  )
                )
              }
            >
              ‹
            </button>
            <h3>
              {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
            </h3>
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    1
                  )
                )
              }
            >
              ›
            </button>
          </div>
          <div className="calendar-grid">
            {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
              <div key={w} className="weekday">
                {w}
              </div>
            ))}
            {days.map((d, i) => {
              if (!d) return <div key={i} />;
              const isToday = d === todayStr;
              const selected = isSelected(d);
              return (
                <div
                  key={i}
                  className={`day 
                    ${isToday ? "today" : ""} 
                    ${selected ? "selected" : ""} 
                    ${holidays[d] ? "holiday" : ""}`}
                  onClick={() => handleClickDate(d)}
                >
                  {new Date(d).getDate()}
                </div>
              );
            })}
          </div>
        </div>

        {/* 右側：入力とリスト */}
        <div className="schedule-section">
          <input
            type="text"
            placeholder="イベントタイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
          />

          {/* モード選択をプルダウン化 */}
          <div style={{ marginTop: "16px" }}>
            <label>日程選択モード：</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="vote-select"
            >
              <option value="range">範囲選択</option>
              <option value="multi">複数選択</option>
            </select>
          </div>

          {/* 時間帯をプルダウン化 */}
          <div style={{ marginTop: "16px" }}>
            <label>時間帯：</label>
            <select
              value={timeType}
              onChange={(e) => setTimeType(e.target.value)}
              className="vote-select"
            >
              <option value="終日">終日</option>
              <option value="午前">午前</option>
              <option value="午後">午後</option>
              <option value="時間指定">時間指定</option>
            </select>
          </div>

          {timeType === "時間指定" && (
            <div className="time-select" style={{ marginTop: "10px" }}>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="vote-select"
              >
                {Array.from({ length: 24 }, (_, i) => `${i}:00`).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <span>〜</span>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="vote-select"
              >
                {Array.from({ length: 24 }, (_, i) => `${i}:00`).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 選択リスト */}
          <div className="selected-list" style={{ marginTop: "20px" }}>
            <h3>選択した日程</h3>
            {mode === "range" ? (
              !range[0] ? (
                <p>日程が選択されていません</p>
              ) : !range[1] ? (
                <p>{range[0].toLocaleDateString()} (開始日)</p>
              ) : (
                <p>
                  {range[0].toLocaleDateString()} 〜 {range[1].toLocaleDateString()}
                </p>
              )
            ) : multiDates.length === 0 ? (
              <p>日程が選択されていません</p>
            ) : (
              <ul>
                {multiDates.map((d, i) => (
                  <li key={i}>
                    {d} ({timeType}
                    {timeType === "時間指定" && ` ${startTime}〜${endTime}`})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 保存 */}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button onClick={handleSave} className="submit-btn">
              共有リンク発行
            </button>
          </div>

          {shareUrl && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <p>発行された共有リンク:</p>
              <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                {shareUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
