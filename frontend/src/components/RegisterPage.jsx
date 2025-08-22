// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import SelectMode from "./SelectMode";
import "../index.css";

const RegisterPage = () => {
  const [mode, setMode] = useState("multi"); // "range" | "multi"
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({});

  // 時間プルダウン用
  const timeOptions = [...Array(24).keys()].map((h) => `${h}:00`);
  const endTimeOptions = [...Array(24).keys()].map((h) => `${h}:00`).concat("24:00");

  // 日付クリック
  const handleDateClick = (date) => {
    const dateStr = date.toDateString();
    if (mode === "multi") {
      if (selectedDates.some((d) => d.toDateString() === dateStr)) {
        setSelectedDates(selectedDates.filter((d) => d.toDateString() !== dateStr));
        const newOptions = { ...dateOptions };
        delete newOptions[dateStr];
        setDateOptions(newOptions);
      } else {
        setSelectedDates([...selectedDates, date]);
        setDateOptions({
          ...dateOptions,
          [dateStr]: { type: "終日", start: null, end: null },
        });
      }
    } else if (mode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const end = date;
        const range = [];
        let d = new Date(start);
        while (d <= end) {
          range.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }
        setSelectedDates(range);
        const newOptions = {};
        range.forEach((d) => {
          newOptions[d.toDateString()] = { type: "終日", start: null, end: null };
        });
        setDateOptions(newOptions);
      } else {
        setSelectedDates([date]);
        setDateOptions({});
      }
    }
  };

  // 区分変更
  const handleTypeChange = (dateStr, value) => {
    setDateOptions({
      ...dateOptions,
      [dateStr]: { ...dateOptions[dateStr], type: value },
    });
  };

  // 開始時刻変更
  const handleStartChange = (dateStr, value) => {
    setDateOptions({
      ...dateOptions,
      [dateStr]: { ...dateOptions[dateStr], start: value },
    });
  };

  // 終了時刻変更
  const handleEndChange = (dateStr, value) => {
    setDateOptions({
      ...dateOptions,
      [dateStr]: { ...dateOptions[dateStr], end: value },
    });
  };

  return (
    <div className="page-container">
      <h2 className="page-title">📅 日程登録</h2>

      {/* モード選択 */}
      <SelectMode mode={mode} setMode={setMode} />

      <div className="register-layout">
        {/* カレンダー */}
        <div className="calendar-section">
          <Calendar
            onClickDay={handleDateClick}
            selectRange={mode === "range"}
            value={selectedDates}
          />
        </div>

        {/* 選択した日程リスト */}
        <div className="schedule-section">
          <h3>選択した日程</h3>
          {selectedDates.length === 0 ? (
            <p>日程を選択してください</p>
          ) : (
            <div>
              {selectedDates.map((d, idx) => {
                const dateStr = d.toDateString();
                const option = dateOptions[dateStr] || { type: "終日", start: null, end: null };
                return (
                  <div key={idx} className="schedule-item">
                    <strong>{dateStr}</strong>
                    <select
                      value={option.type}
                      onChange={(e) => handleTypeChange(dateStr, e.target.value)}
                    >
                      <option value="終日">終日</option>
                      <option value="午前">午前</option>
                      <option value="午後">午後</option>
                      <option value="時間指定">時間指定</option>
                    </select>

                    {/* 時間指定を選んだ場合のみ追加プルダウン */}
                    {option.type === "時間指定" && (
                      <>
                        <label>開始</label>
                        <select
                          value={option.start || ""}
                          onChange={(e) => handleStartChange(dateStr, e.target.value)}
                        >
                          <option value="">--</option>
                          {timeOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <label>終了</label>
                        <select
                          value={option.end || ""}
                          onChange={(e) => handleEndChange(dateStr, e.target.value)}
                        >
                          <option value="">--</option>
                          {endTimeOptions.map((t) => (
                            <option
                              key={t}
                              value={t}
                              disabled={
                                option.start &&
                                parseInt(t) <= parseInt(option.start)
                              }
                            >
                              {t}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
