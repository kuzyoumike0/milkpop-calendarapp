import React, { useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../register.css";

const hd = new Holidays("JP");

// 日本時間の今日
const getTodayJST = () => {
  const now = new Date();
  const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  return jst;
};

// 月の日付を生成
const generateCalendar = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks = [];
  let current = new Date(firstDay);
  current.setDate(current.getDate() - current.getDay());

  while (current <= lastDay || current.getDay() !== 0) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
};

const RegisterPage = () => {
  const today = getTodayJST();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [weeks, setWeeks] = useState([]);
  const [mode, setMode] = useState("range");
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");

  // 日付ごとの時間帯設定 & 時間指定
  const [timeSettings, setTimeSettings] = useState({});
  // 共有リンク
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setWeeks(generateCalendar(currentYear, currentMonth));
  }, [currentYear, currentMonth]);

  const isSameDate = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const formatDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  // 日付クリック処理
  const handleSelect = (date) => {
    if (mode === "single") {
      if (selectedDates.length === 1 && isSameDate(selectedDates[0], date)) {
        setSelectedDates([]);
      } else {
        setSelectedDates([date]);
      }
    } else if (mode === "multiple") {
      const exists = selectedDates.find((d) => isSameDate(d, date));
      if (exists) {
        setSelectedDates(selectedDates.filter((d) => !isSameDate(d, date)));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else if (mode === "range") {
      if (selectedDates.length === 0 || selectedDates.length > 1) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const range = [];
        const min = start < date ? start : date;
        const max = start > date ? start : date;
        let cur = new Date(min);
        while (cur <= max) {
          range.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(range);
      }
    }
  };

  const isSelected = (date) =>
    selectedDates.some((d) => isSameDate(d, date));

  const holiday = (date) => {
    const h = hd.isHoliday(date);
    return h ? h[0].name : null;
  };

  // 時間区分の切り替え
  const toggleTime = (date, type) => {
    const key = formatDateKey(date);
    setTimeSettings((prev) => {
      const current = prev[key] || {};
      const newActive = { ...(current.activeTimes || {}) };
      newActive[type] = !newActive[type];
      return { ...prev, [key]: { ...current, activeTimes: newActive } };
    });
  };

  // 時間指定の変更
  const handleTimeChange = (date, type, value) => {
    const key = formatDateKey(date);
    setTimeSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], [type]: value },
    }));
  };

  // ✅ 共有リンク生成（バックエンドに保存して share_token を取得）
  const generateShareLink = async () => {
    try {
      const payload = {
        title,
        dates: selectedDates.map((d) => ({
          date: formatDateKey(d),
          timeType: "終日", // TODO: 実際は activeTimes や start/end を反映
        })),
      };

      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("共有リンク生成失敗");
      const data = await res.json();

      const url = `${window.location.origin}/share/${data.share_token}`;
      setShareUrl(url);
    } catch (err) {
      console.error(err);
      alert("共有リンク生成に失敗しました");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("URLをコピーしました！");
  };

  return (
    <div className="register-page">
      <h1 className="page-title">MilkPOP Calendar</h1>

      <input
        type="text"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="title-input"
      />

      {/* モード切替 */}
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
        {/* カレンダー本体 */}
        <div className="calendar-box">
          <div className="calendar-header">
            <button onClick={() => setCurrentMonth(currentMonth - 1)}>◀</button>
            <span>
              {currentYear}年 {currentMonth + 1}月
            </span>
            <button onClick={() => setCurrentMonth(currentMonth + 1)}>▶</button>
          </div>

          <table className="calendar-table">
            <thead>
              <tr>
                <th className="sunday">日</th>
                <th>月</th>
                <th>火</th>
                <th>水</th>
                <th>木</th>
                <th>金</th>
                <th className="saturday">土</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, i) => (
                <tr key={i}>
                  {week.map((date, j) => {
                    const isToday = isSameDate(date, today);
                    const selected = isSelected(date);
                    const hol = holiday(date);
                    const isCurrentMonth = date.getMonth() === currentMonth;
                    return (
                      <td
                        key={j}
                        className={`cell 
                          ${isToday ? "today" : ""} 
                          ${selected ? "selected-date" : ""} 
                          ${date.getDay() === 0 ? "sunday" : ""} 
                          ${date.getDay() === 6 ? "saturday" : ""} 
                          ${!isCurrentMonth ? "other-month" : ""}`}
                        onClick={() => isCurrentMonth && handleSelect(date)}
                      >
                        {date.getDate()}
                        {hol && <div className="holiday-name">{hol}</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 選択中リスト */}
        <div className="selected-list">
          <h2>選択中の日程</h2>
          {[...selectedDates]
            .sort((a, b) => a - b)
            .map((d, idx) => {
              const key = formatDateKey(d);
              const setting = timeSettings[key] || {};
              const active = setting.activeTimes || {};
              return (
                <div key={idx} className="selected-card">
                  <span className="date-badge">
                    {d.getFullYear()}-
                    {String(d.getMonth() + 1).padStart(2, "0")}-
                    {String(d.getDate()).padStart(2, "0")}
                  </span>
                  <div className="time-buttons">
                    {["終日", "昼", "夜"].map((label) => (
                      <button
                        key={label}
                        className={`time-btn ${active[label] ? "active" : ""}`}
                        onClick={() => toggleTime(d, label)}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      className="time-btn"
                      onClick={() =>
                        setTimeSettings((prev) => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            showTimeSelect: !prev[key]?.showTimeSelect,
                          },
                        }))
                      }
                    >
                      時間指定
                    </button>
                  </div>

                  {setting.showTimeSelect && (
                    <div className="time-selects">
                      <select
                        className="cute-select"
                        value={setting.start || ""}
                        onChange={(e) => handleTimeChange(d, "start", e.target.value)}
                      >
                        <option value="">開始時刻</option>
                        {Array.from({ length: 24 }).map((_, h) => (
                          <option key={h} value={`${h}:00`}>
                            {h}:00
                          </option>
                        ))}
                      </select>
                      <span>〜</span>
                      <select
                        className="cute-select"
                        value={setting.end || ""}
                        onChange={(e) => handleTimeChange(d, "end", e.target.value)}
                      >
                        <option value="">終了時刻</option>
                        {Array.from({ length: 24 }).map((_, h) => (
                          <option key={h} value={`${h}:00`}>
                            {h}:00
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}

          {/* 共有リンク発行 */}
          <button className="share-btn" onClick={generateShareLink}>
            共有リンク発行
          </button>
          {shareUrl && (
            <div className="share-link-box">
              <a href={shareUrl} target="_blank" rel="noreferrer">
                {shareUrl}
              </a>
              <button className="copy-btn" onClick={copyToClipboard}>
                コピー
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
