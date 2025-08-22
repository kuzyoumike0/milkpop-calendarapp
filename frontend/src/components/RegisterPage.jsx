// frontend/src/components/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("range"); // range | multi
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [timeType, setTimeType] = useState("終日");
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

  // ==== 日付クリック（複数選択モード） ====
  const handleMultiClick = (date) => {
    const dStr = date.toISOString().split("T")[0];
    if (multiDates.includes(dStr)) {
      setMultiDates(multiDates.filter((d) => d !== dStr));
    } else {
      setMultiDates([...multiDates, dStr]);
    }
  };

  // ==== 保存処理 ====
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

  // ==== カレンダーのタイル装飾 ====
  const tileClassName = ({ date }) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const dStr = date.toISOString().split("T")[0];

    if (dStr === todayStr) return "today-highlight";
    if (holidays[dStr]) return "holiday-highlight";

    if (mode === "multi" && multiDates.includes(dStr)) return "selected-date";

    if (mode === "range" && range[0] && !range[1] && dStr === range[0].toISOString().split("T")[0]) {
      return "selected-date"; // 範囲開始日
    }

    return null;
  };

  return (
    <main className="page-container">
      <h2 className="page-title">日程登録ページ</h2>

      <div className="register-layout">
        {/* 左側：入力フォーム */}
        <div className="calendar-section">
          <input
            type="text"
            placeholder="イベントタイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
          />

          {/* 選択モード */}
          <div className="radio-group horizontal">
            <label
              className={`radio-label ${
                mode === "range" ? "radio-active" : ""
              }`}
            >
              <input
                type="radio"
                value="range"
                checked={mode === "range"}
                onChange={(e) => setMode(e.target.value)}
              />
              範囲選択
            </label>
            <label
              className={`radio-label ${
                mode === "multi" ? "radio-active" : ""
              }`}
            >
              <input
                type="radio"
                value="multi"
                checked={mode === "multi"}
                onChange={(e) => setMode(e.target.value)}
              />
              複数選択
            </label>
          </div>

          {/* 時間帯選択 */}
          <div className="radio-group horizontal" style={{ marginTop: "16px" }}>
            {["終日", "午前", "午後", "時間指定"].map((t) => (
              <label
                key={t}
                className={`radio-label ${timeType === t ? "radio-active" : ""}`}
              >
                <input
                  type="radio"
                  value={t}
                  checked={timeType === t}
                  onChange={(e) => setTimeType(e.target.value)}
                />
                {t}
              </label>
            ))}
          </div>

          {/* 時間指定用プルダウン */}
          {timeType === "時間指定" && (
            <div className="time-select" style={{ marginTop: "10px" }}>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
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
              >
                {Array.from({ length: 24 }, (_, i) => `${i}:00`).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 右側：カレンダー＋選択リスト */}
        <div className="schedule-section">
          <Calendar
            className="custom-calendar"
            selectRange={mode === "range"}
            onChange={
              mode === "range" ? setRange : (date) => handleMultiClick(date)
            }
            value={mode === "range" ? range : null}
            tileClassName={tileClassName}
          />

          {/* 選択した日程リスト */}
          <div className="selected-list" style={{ marginTop: "20px" }}>
            <h3>選択した日程</h3>
            {mode === "range" ? (
              !range[0] || !range[1] ? (
                <p>日程が選択されていません</p>
              ) : (
                <p>
                  {range[0].toLocaleDateString()} 〜{" "}
                  {range[1].toLocaleDateString()}
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
        </div>
      </div>

      {/* 保存ボタン */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={handleSave} className="submit-btn">
          共有リンク発行
        </button>
      </div>

      {/* 発行された共有リンク */}
      {shareUrl && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p>発行された共有リンク:</p>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#004CA0", fontWeight: "bold" }}
          >
            {shareUrl}
          </a>
        </div>
      )}
    </main>
  );
};

export default RegisterPage;
