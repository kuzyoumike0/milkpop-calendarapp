// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "../index.css";

const RegisterPage = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({}); // 日付ごとの区分設定

  const mainOptions = ["終日", "午前", "午後", "時間指定"];
  const timeOptions = [...Array(24).keys()].map((h) => `${h}:00`);
  const endTimeOptions = [...Array(24).keys()].map((h) => `${h}:00`).concat("24:00");

  // 日付クリック処理
  const handleDateClick = (date) => {
    const dateStr = date.toDateString();
    if (selectedDates.includes(dateStr)) {
      // 選択解除
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
      const newOptions = { ...dateOptions };
      delete newOptions[dateStr];
      setDateOptions(newOptions);
    } else {
      // 新規選択
      setSelectedDates([...selectedDates, dateStr]);
      setDateOptions({
        ...dateOptions,
        [dateStr]: { type: "終日", start: "0:00", end: "24:00" },
      });
    }
  };

  // 区分変更
  const handleTypeChange = (dateStr, value) => {
    setDateOptions({
      ...dateOptions,
      [dateStr]: {
        type: value,
        start: "0:00",
        end: "24:00",
      },
    });
  };

  // 開始時刻変更
  const handleStartChange = (dateStr, value) => {
    const current = dateOptions[dateStr];
    // 終了時刻より前ならOK
    if (endTimeOptions.indexOf(value) < endTimeOptions.indexOf(current.end)) {
      setDateOptions({
        ...dateOptions,
        [dateStr]: { ...current, start: value },
      });
    }
  };

  // 終了時刻変更
  const handleEndChange = (dateStr, value) => {
    const current = dateOptions[dateStr];
    // 開始時刻より後ならOK
    if (timeOptions.indexOf(current.start) < timeOptions.indexOf(value)) {
      setDateOptions({
        ...dateOptions,
        [dateStr]: { ...current, end: value },
      });
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録</h2>

      <div className="register-layout">
        {/* カレンダー */}
        <div className="calendar-section">
          <Calendar onClickDay={handleDateClick} />
        </div>

        {/* 選択日程リスト */}
        <div className="schedule-section">
          <h3>選択した日程</h3>
          {selectedDates.length === 0 ? (
            <p>まだ日程が選択されていません。</p>
          ) : (
            <div>
              {selectedDates.map((dateStr) => {
                const opt = dateOptions[dateStr];
                return (
                  <div key={dateStr} className="schedule-item">
                    <span>{dateStr}</span>
                    {/* メイン区分 */}
                    <select
                      value={opt.type}
                      onChange={(e) => handleTypeChange(dateStr, e.target.value)}
                      className="vote-select"
                    >
                      {mainOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    {/* 時間指定ならさらに2つ表示 */}
                    {opt.type === "時間指定" && (
                      <>
                        <select
                          value={opt.start}
                          onChange={(e) => handleStartChange(dateStr, e.target.value)}
                          className="vote-select"
                        >
                          {timeOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <span>〜</span>
                        <select
                          value={opt.end}
                          onChange={(e) => handleEndChange(dateStr, e.target.value)}
                          className="vote-select"
                        >
                          {endTimeOptions.map((t) => (
                            <option key={t} value={t}>
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
