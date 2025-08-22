import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const RegisterPage = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeOptions, setTimeOptions] = useState({}); // { "2025-08-22": "終日", ... }
  const [timeRanges, setTimeRanges] = useState({}); // { "2025-08-22": {start:"09:00", end:"18:00"} }

  // 日付をクリックしたとき
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
    if (!selectedDates.includes(dateStr)) {
      const newDates = [...selectedDates, dateStr].sort();
      setSelectedDates(newDates);
    }
  };

  // プルダウン変更
  const handleOptionChange = (date, value) => {
    setTimeOptions({ ...timeOptions, [date]: value });
  };

  // 時刻範囲変更
  const handleTimeChange = (date, type, value) => {
    setTimeRanges({
      ...timeRanges,
      [date]: { ...timeRanges[date], [type]: value },
    });
  };

  return (
    <div className="register-layout">
      {/* 左側：カレンダー */}
      <div className="calendar-section">
        <Calendar onClickDay={handleDateClick} />
      </div>

      {/* 右側：登録日程一覧 */}
      <div className="schedule-section">
        <h3>📅 登録済みの日程</h3>
        {selectedDates.length === 0 && <p>日程を選択してください</p>}
        <ul>
          {selectedDates.map((date) => (
            <li key={date} className="schedule-item">
              <span>{date}</span>
              <select
                value={timeOptions[date] || ""}
                onChange={(e) => handleOptionChange(date, e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="終日">終日</option>
                <option value="昼">昼</option>
                <option value="夜">夜</option>
                <option value="時刻指定">時刻指定</option>
              </select>

              {/* 時刻指定が選ばれた場合だけ開始/終了プルダウン */}
              {timeOptions[date] === "時刻指定" && (
                <div className="time-select">
                  <select
                    value={timeRanges[date]?.start || "09:00"}
                    onChange={(e) =>
                      handleTimeChange(date, "start", e.target.value)
                    }
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, "0");
                      return (
                        <option key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </option>
                      );
                    })}
                  </select>
                  ～
                  <select
                    value={timeRanges[date]?.end || "18:00"}
                    onChange={(e) =>
                      handleTimeChange(date, "end", e.target.value)
                    }
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, "0");
                      return (
                        <option key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RegisterPage;
