// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Holidays from "date-holidays";
import "../register.css";

export default function RegisterPage() {
  const [title, setTitle] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState({});
  const [mode, setMode] = useState("single"); // "single" | "multiple" | "range"
  const [rangeStart, setRangeStart] = useState(null);
  const [shareLink, setShareLink] = useState("");

  const hd = new Holidays("JP");

  // ==== カレンダー生成 ====
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weeks = [];
  let day = new Date(firstDay);
  while (day <= lastDay) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    weeks.push(week);
  }

  const todayIso = new Date().toISOString().split("T")[0];

  // ==== 日付クリック ====
  const handleDateClick = (date) => {
    const iso = date.toISOString().split("T")[0];

    if (mode === "single") {
      setSelectedDates({ [iso]: true });
    } else if (mode === "multiple") {
      setSelectedDates((prev) => {
        const newDates = { ...prev };
        if (newDates[iso]) delete newDates[iso];
        else newDates[iso] = true;
        return newDates;
      });
    } else if (mode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
      } else {
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;
        const rangeDates = {};
        let d = new Date(start);
        while (d <= end) {
          const dIso = d.toISOString().split("T")[0];
          rangeDates[dIso] = true;
          d.setDate(d.getDate() + 1);
        }
        setSelectedDates(rangeDates);
        setRangeStart(null);
      }
    }
  };

  // ==== 共有リンク発行 ====
  const handleShare = () => {
    const token = Math.random().toString(36).substring(2, 10);
    setShareLink(`${window.location.origin}/share/${token}`);
  };

  return (
    <div className="register-page">
      <h1 className="page-title">日程登録</h1>
      <input
        type="text"
        placeholder="タイトルを入力してください"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="title-input"
      />

      {/* モード切替 */}
      <div className="select-mode">
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

      <div className="calendar-list-container">
        {/* ==== 左：カレンダー ==== */}
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
              ◀
            </button>
            <span>{year}年 {month + 1}月</span>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
              ▶
            </button>
          </div>

          <table className="calendar-table">
            <thead>
              <tr>
                <th>日</th><th>月</th><th>火</th><th>水</th>
                <th>木</th><th>金</th><th>土</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, i) => (
                <tr key={i}>
                  {week.map((d, j) => {
                    const iso = d.toISOString().split("T")[0];
                    const isToday = iso === todayIso;
                    const isSelected = selectedDates[iso];
                    const holiday = hd.isHoliday(d);

                    return (
                      <td
                        key={j}
                        className={`cell
                          ${isToday ? "today" : ""}
                          ${isSelected ? "selected" : ""}
                          ${holiday ? "holiday" : ""}
                          ${j === 0 ? "sunday" : ""}
                          ${j === 6 ? "saturday" : ""}`}
                        onClick={() => handleDateClick(d)}
                      >
                        {d.getMonth() === month ? d.getDate() : ""}
                        {holiday && <div className="holiday-name">{holiday[0].name}</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ==== 右：選択済みリスト ==== */}
        <div className="side-panel">
          <h2>選択中の日程</h2>
          {Object.keys(selectedDates).length === 0 ? (
            <p>まだ日程が選択されていません</p>
          ) : (
            <ul>
              {Object.keys(selectedDates).map((date) => (
                <li key={date}>{date}</li>
              ))}
            </ul>
          )}

          <button className="register-btn" onClick={handleShare}>
            共有リンク発行
          </button>

          {shareLink && (
            <div className="share-link-box">
              <a href={shareLink} target="_blank" rel="noreferrer">{shareLink}</a>
              <button onClick={() => navigator.clipboard.writeText(shareLink)}>コピー</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
