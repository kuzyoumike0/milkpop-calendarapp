// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Holidays from "date-holidays";
import "../register.css";

export default function RegisterPage() {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shareLink, setShareLink] = useState("");
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [mode, setMode] = useState("multiple"); // "multiple" or "range"

  const hd = new Holidays("JP");

  // 日本時間の今日
  const today = new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });

  // ==== カレンダー生成 ====
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  // ==== 範囲の日付を配列化 ====
  const getDatesBetween = (start, end) => {
    const dates = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(
        current.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })
      );
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // ==== 日付クリック処理 ====
  const handleDateClick = (date) => {
    const dateStr = date.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });

    if (mode === "multiple") {
      // 複数選択モード：クリックで ON/OFF
      if (selectedDates[dateStr]) {
        const updated = { ...selectedDates };
        delete updated[dateStr];
        setSelectedDates(updated);
      } else {
        setSelectedDates({
          ...selectedDates,
          [dateStr]: { timeType: "allday", startTime: "09:00", endTime: "18:00" },
        });
      }
    } else if (mode === "range") {
      // 範囲選択モード
      if (rangeStart && !rangeEnd) {
        setRangeEnd(date);
        const datesInRange =
          date >= rangeStart
            ? getDatesBetween(rangeStart, date)
            : getDatesBetween(date, rangeStart);

        const updated = { ...selectedDates };
        datesInRange.forEach((d) => {
          updated[d] = {
            timeType: "allday",
            startTime: "09:00",
            endTime: "18:00",
          };
        });
        setSelectedDates(updated);
        setRangeStart(null);
        setRangeEnd(null);
        setHoverDate(null);
      } else {
        setRangeStart(date);
        setRangeEnd(null);
        setHoverDate(null);
      }
    }
  };

  // ==== 時間区分変更 ====
  const updateTimeSetting = (dateStr, field, value) => {
    setSelectedDates({
      ...selectedDates,
      [dateStr]: { ...selectedDates[dateStr], [field]: value },
    });
  };

  // ==== 登録処理 ====
  const handleRegister = async () => {
    if (!title || Object.keys(selectedDates).length === 0) return;

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          dates: selectedDates,
        }),
      });
      const data = await res.json();
      if (data.share_token) {
        const url = `${window.location.origin}/share/${data.share_token}`;
        setShareLink(url);
      }
    } catch (err) {
      console.error("登録エラー:", err);
    }
  };

  // ==== 月移動 ====
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // ==== コピー ====
  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert("リンクをコピーしました！");
    }
  };

  return (
    <div className="register-page">
      <h1 className="page-title">日程登録</h1>

      {/* タイトル入力 */}
      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力してください"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* モード切替 */}
      <div className="select-mode">
        <button
          className={mode === "multiple" ? "active" : ""}
          onClick={() => {
            setMode("multiple");
            setRangeStart(null);
            setRangeEnd(null);
          }}
        >
          複数選択
        </button>
        <button
          className={mode === "range" ? "active" : ""}
          onClick={() => {
            setMode("range");
            setRangeStart(null);
            setRangeEnd(null);
          }}
        >
          範囲選択
        </button>
      </div>

      <div className="calendar-list-container">
        {/* カレンダー */}
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={prevMonth}>◀</button>
            <div className="calendar-title">
              {year}年 {month + 1}月
            </div>
            <button onClick={nextMonth}>▶</button>
          </div>

          <table className="custom-calendar">
            <thead>
              <tr>
                {weekdays.map((day, i) => (
                  <th key={i} className={i === 0 ? "sunday" : i === 6 ? "saturday" : ""}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, week) => (
                <tr key={week}>
                  {Array.from({ length: 7 }, (_, dow) => {
                    const dateNum = week * 7 + dow - firstDay.getDay() + 1;
                    if (dateNum < 1 || dateNum > lastDay.getDate()) {
                      return <td key={dow}></td>;
                    }
                    const date = new Date(year, month, dateNum);
                    const dateStr = date.toLocaleDateString("ja-JP", {
                      timeZone: "Asia/Tokyo",
                    });

                    // 祝日チェック
                    const holidayInfo = hd.isHoliday(date);
                    const isHoliday = holidayInfo && holidayInfo[0];

                    let cellClass = "cell";
                    if (date.getDay() === 0) cellClass += " sunday";
                    if (date.getDay() === 6) cellClass += " saturday";
                    if (dateStr === today) cellClass += " today";
                    if (selectedDates[dateStr]) cellClass += " selected";

                    // 範囲プレビュー
                    if (
                      mode === "range" &&
                      rangeStart &&
                      !rangeEnd &&
                      hoverDate &&
                      ((date >= rangeStart && date <= hoverDate) ||
                        (date <= rangeStart && date >= hoverDate))
                    ) {
                      cellClass += " range-preview";
                    }

                    if (isHoliday) cellClass += " holiday";

                    return (
                      <td
                        key={dow}
                        className={cellClass}
                        onClick={() => handleDateClick(date)}
                        onMouseEnter={() => setHoverDate(date)}
                      >
                        <div>{dateNum}</div>
                        {isHoliday && (
                          <div className="holiday-name">{holidayInfo[0].name}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* サイドパネル */}
        <div className="side-panel">
          <div className="events-list">
            <h2>選択中の日程</h2>
            {Object.keys(selectedDates).length > 0 ? (
              Object.entries(selectedDates)
                .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                .map(([dateStr, setting], i) => (
                  <div key={i} className="date-card">
                    <span className="date-label">{dateStr}</span>
                    <div className="time-options">
                      <button
                        className={setting.timeType === "allday" ? "active" : ""}
                        onClick={() =>
                          updateTimeSetting(dateStr, "timeType", "allday")
                        }
                      >
                        終日
                      </button>
                      <button
                        className={setting.timeType === "day" ? "active" : ""}
                        onClick={() =>
                          updateTimeSetting(dateStr, "timeType", "day")
                        }
                      >
                        午前
                      </button>
                      <button
                        className={setting.timeType === "night" ? "active" : ""}
                        onClick={() =>
                          updateTimeSetting(dateStr, "timeType", "night")
                        }
                      >
                        午後
                      </button>
                      <button
                        className={setting.timeType === "custom" ? "active" : ""}
                        onClick={() =>
                          updateTimeSetting(dateStr, "timeType", "custom")
                        }
                      >
                        時間指定
                      </button>
                    </div>
                    {setting.timeType === "custom" && (
                      <div className="time-range">
                        <select
                          className="cute-select"
                          value={setting.startTime}
                          onChange={(e) =>
                            updateTimeSetting(dateStr, "startTime", e.target.value)
                          }
                        >
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = String(i).padStart(2, "0");
                            return (
                              <option key={i} value={`${hour}:00`}>
                                {hour}:00
                              </option>
                            );
                          })}
                        </select>
                        <span> ~ </span>
                        <select
                          className="cute-select"
                          value={setting.endTime}
                          onChange={(e) =>
                            updateTimeSetting(dateStr, "endTime", e.target.value)
                          }
                        >
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = String(i).padStart(2, "0");
                            return (
                              <option key={i} value={`${hour}:00`}>
                                {hour}:00
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <p>未選択</p>
            )}
          </div>

          <button className="register-btn" onClick={handleRegister}>
            登録
          </button>

          {shareLink && (
            <div className="share-link-box">
              <a href={shareLink} target="_blank" rel="noreferrer">
                {shareLink}
              </a>
              <br />
              <button className="copy-btn" onClick={copyToClipboard}>
                コピー
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
