import React, { useState, useEffect } from "react";
import axios from "axios";
import "../index.css";

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

const RegisterPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [shareUrl, setShareUrl] = useState("");

  // 月初めの日と末日の情報を生成
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  // 日付クリック
  const handleDateClick = (day) => {
    const clicked = new Date(year, month, day);
    const dateStr = clicked.toISOString().split("T")[0];

    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
      setSchedules(schedules.filter((s) => s.date !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
      setSchedules([
        ...schedules,
        { date: dateStr, timeType: "終日", start: "", end: "" },
      ]);
    }
  };

  // 前月・翌月移動
  const prevMonth = () =>
    setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1));

  // 時間帯の変更
  const handleTimeChange = (date, value) => {
    setSchedules(
      schedules.map((s) =>
        s.date === date ? { ...s, timeType: value } : s
      )
    );
  };

  // 時刻範囲の変更
  const handleTimeRangeChange = (date, field, value) => {
    setSchedules(
      schedules.map((s) =>
        s.date === date ? { ...s, [field]: value } : s
      )
    );
  };

  // サーバーに保存して共有リンク生成
  const handleShare = async () => {
    try {
      const res = await axios.post("/api/share", { schedules });
      setShareUrl(res.data.url);
    } catch (err) {
      console.error(err);
      alert("共有リンクの生成に失敗しました");
    }
  };

  // 日程を日付順にソート
  const sortedSchedules = [...schedules].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="register-layout">
      {/* ===== カレンダー ===== */}
      <div className="calendar-section">
        <div className="calendar-header">
          <button onClick={prevMonth}>←</button>
          <h2>
            {year}年 {month + 1}月
          </h2>
          <button onClick={nextMonth}>→</button>
        </div>

        <div className="calendar-weekdays">
          {weekdays.map((w) => (
            <div key={w} className="calendar-weekday">
              {w}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1;
            const dateStr = new Date(year, month, day)
              .toISOString()
              .split("T")[0];
            const isToday =
              dateStr === new Date().toISOString().split("T")[0];
            const isSelected = selectedDates.includes(dateStr);

            return (
              <div
                key={day}
                className={`calendar-day 
                  ${isToday ? "today" : ""} 
                  ${isSelected ? "selected" : ""}`}
                onClick={() => handleDateClick(day)}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== 登録済み日程一覧 ===== */}
      <div className="schedule-section">
        <h3>📅 登録した日程</h3>
        {sortedSchedules.length === 0 ? (
          <p>日程が選択されていません</p>
        ) : (
          sortedSchedules.map((s, i) => (
            <div key={i} className="schedule-item">
              <span>{s.date}</span>
              <select
                value={s.timeType}
                onChange={(e) =>
                  handleTimeChange(s.date, e.target.value)
                }
              >
                <option value="終日">終日</option>
                <option value="昼">昼</option>
                <option value="夜">夜</option>
                <option value="時間指定">時間指定</option>
              </select>
              {s.timeType === "時間指定" && (
                <div className="time-select-wrapper">
                  <input
                    type="time"
                    value={s.start}
                    onChange={(e) =>
                      handleTimeRangeChange(s.date, "start", e.target.value)
                    }
                  />
                  〜
                  <input
                    type="time"
                    value={s.end}
                    onChange={(e) =>
                      handleTimeRangeChange(s.date, "end", e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          ))
        )}

        <button className="share-link-button" onClick={handleShare}>
          共有リンクを作成
        </button>

        {shareUrl && (
          <div style={{ marginTop: "12px", textAlign: "center" }}>
            <p>🔗 共有リンク:</p>
            <a href={shareUrl} target="_blank" rel="noreferrer">
              {shareUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
