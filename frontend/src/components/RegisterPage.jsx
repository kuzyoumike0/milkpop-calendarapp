// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import SelectMode from "./SelectMode";
import "../index.css";

const RegisterPage = () => {
  const [mode, setMode] = useState("range");
  const [selectedDates, setSelectedDates] = useState([]);

  // 開始時刻 0:00〜23:00
  const [timeOptions] = useState([...Array(24).keys()].map(h => `${h}:00`));
  // 終了時刻 0:00〜23:00 + 翌日0:00
  const [endTimeOptions] = useState([...Array(24).keys()].map(h => `${h}:00`).concat("24:00"));

  const [dateOptions, setDateOptions] = useState({}); // 日ごとの区分・時刻を保持

  // 日付クリック処理
  const handleDateClick = (date) => {
    const dateStr = date.toDateString();
    if (mode === "multi") {
      if (selectedDates.some(d => d.toDateString() === dateStr)) {
        setSelectedDates(selectedDates.filter(d => d.toDateString() !== dateStr));
        const updated = { ...dateOptions };
        delete updated[dateStr];
        setDateOptions(updated);
      } else {
        setSelectedDates([...selectedDates, date]);
        setDateOptions({
          ...dateOptions,
          [dateStr]: { type: "終日", start: "0:00", end: "23:00" }
        });
      }
    } else {
      if (selectedDates.some(d => d.toDateString() === dateStr)) {
        setSelectedDates([]);
        setDateOptions({});
      } else {
        setSelectedDates([date]);
        setDateOptions({
          [dateStr]: { type: "終日", start: "0:00", end: "23:00" }
        });
      }
    }
  };

  // 区分変更
  const handleTypeChange = (dateStr, value) => {
    setDateOptions({
      ...dateOptions,
      [dateStr]: { ...dateOptions[dateStr], type: value }
    });
  };

  // 時刻変更
  const handleTimeChange = (dateStr, field, value) => {
    let updated = { ...dateOptions };
    updated[dateStr][field] = value;

    // index計算（終了だけ"24:00"対応）
    const startIdx = timeOptions.indexOf(updated[dateStr].start);
    const endIdx = updated[dateStr].end === "24:00"
      ? 24
      : timeOptions.indexOf(updated[dateStr].end);

    if (startIdx >= endIdx) {
      if (field === "start") {
        // 開始を動かしたとき → 終了を最低でも+1時間に
        updated[dateStr].end = startIdx < 23 ? timeOptions[startIdx + 1] : "24:00";
      } else {
        // 終了を動かしたとき → 開始を手前にずらす
        updated[dateStr].start = endIdx > 0 ? timeOptions[endIdx - 1] : "0:00";
      }
    }

    setDateOptions(updated);
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録ページ</h2>

      <div className="register-layout">
        {/* ===== 左：カレンダー ===== */}
        <div className="calendar-section">
          <div className="calendar-header">
            <SelectMode mode={mode} setMode={setMode} />
          </div>
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={({ date }) =>
              selectedDates.some(d => d.toDateString() === date.toDateString())
                ? "selected-date"
                : null
            }
          />
        </div>

        {/* ===== 右：選択日程リスト ===== */}
        <div className="schedule-section">
          <h3>選択した日程</h3>
          {selectedDates.length === 0 && <p>日程を選択してください。</p>}
          {selectedDates.map((d, i) => {
            const dateStr = d.toDateString();
            const option = dateOptions[dateStr] || { type: "終日", start: "0:00", end: "23:00" };
            return (
              <div key={i} className="schedule-item">
                <span>{d.toLocaleDateString()}</span>
                {/* 区分選択 */}
                <select
                  className="vote-select"
                  value={option.type}
                  onChange={(e) => handleTypeChange(dateStr, e.target.value)}
                >
                  <option value="終日">終日</option>
                  <option value="昼">昼</option>
                  <option value="夜">夜</option>
                  <option value="時刻指定">時刻指定</option>
                </select>

                {/* 時刻指定のときのみ表示 */}
                {option.type === "時刻指定" && (
                  <div className="time-selects">
                    <select
                      value={option.start}
                      onChange={(e) => handleTimeChange(dateStr, "start", e.target.value)}
                    >
                      {timeOptions.map((t, idx) => (
                        <option key={idx} value={t}>{t}</option>
                      ))}
                    </select>
                    <span>〜</span>
                    <select
                      value={option.end}
                      onChange={(e) => handleTimeChange(dateStr, "end", e.target.value)}
                    >
                      {endTimeOptions.map((t, idx) => (
                        <option key={idx} value={t}>{t === "24:00" ? "翌日0:00" : t}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
