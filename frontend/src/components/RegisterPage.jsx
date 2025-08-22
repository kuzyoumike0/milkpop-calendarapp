// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const RegisterPage = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [rangeStart, setRangeStart] = useState(null);
  const [division, setDivision] = useState("午前"); // 区分
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  // カレンダー日付クリック
  const handleDateClick = (date) => {
    if (!rangeStart) {
      setRangeStart(date);
      setSelectedDates([date]);
    } else {
      const start = rangeStart < date ? rangeStart : date;
      const end = rangeStart < date ? date : rangeStart;

      const days = [];
      let d = new Date(start);
      while (d <= end) {
        days.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      setSelectedDates(days);
      setRangeStart(null);
    }
  };

  // 日付の表示形式 (YYYY/MM/DD)
  const formatDate = (date) =>
    `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

  // 時刻リスト（1時〜24時）
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = String(i).padStart(2, "0");
    return `${hour}:00`;
  });

  // 終了時刻制御
  const handleStartTimeChange = (e) => {
    const newStart = e.target.value;
    setStartTime(newStart);

    // 開始時間より終了時間が早いなら自動修正
    if (endTime <= newStart) {
      const nextIndex = timeOptions.indexOf(newStart) + 1;
      setEndTime(timeOptions[nextIndex] || "23:00");
    }
  };

  return (
    <div className="page-card">
      <h2 className="page-title">日程登録</h2>
      <p className="page-subtitle">カレンダーから日付を選んでください</p>

      {/* カレンダー */}
      <div className="calendar-container">
        <Calendar
          onClickDay={handleDateClick}
          value={selectedDates}
          tileClassName={({ date }) => {
            const isSelected = selectedDates.some(
              (d) =>
                d.getFullYear() === date.getFullYear() &&
                d.getMonth() === date.getMonth() &&
                d.getDate() === date.getDate()
            );
            return isSelected ? "selected-day" : "";
          }}
        />
      </div>

      {/* 選択した日付 & 区分 */}
      {selectedDates.length > 0 && (
        <div className="form-group">
          <label>選択した日付:</label>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span>{selectedDates.map((d) => formatDate(d)).join(" , ")}</span>

            {/* 区分プルダウン */}
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              style={{ width: "120px" }}
            >
              <option value="午前">午前</option>
              <option value="午後">午後</option>
              <option value="終日">終日</option>
              <option value="時間指定">時間指定</option>
            </select>

            {/* 時間指定の場合だけ表示 */}
            {division === "時間指定" && (
              <>
                <label>開始:</label>
                <select value={startTime} onChange={handleStartTimeChange}>
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <label>終了:</label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                >
                  {timeOptions
                    .filter((t) => t > startTime)
                    .map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                </select>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
