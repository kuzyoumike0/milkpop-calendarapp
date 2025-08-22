// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "../index.css";

const RegisterPage = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [division, setDivision] = useState("午前");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [events, setEvents] = useState([]);

  // 日付クリック
  const handleDateClick = (date) => {
    setSelectedDates([date]); // 単一日付選択に戻す
  };

  // 日付フォーマット
  const formatDate = (date) =>
    `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

  // 時刻リスト
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = String(i).padStart(2, "0");
    return `${hour}:00`;
  });

  // ✅ イベント追加
  const handleAddEvent = () => {
    if (selectedDates.length === 0) return;

    const newEvent = {
      id: Date.now(),
      date: formatDate(selectedDates[0]),
      division,
      startTime: division === "時間指定" ? startTime : null,
      endTime: division === "時間指定" ? endTime : null,
    };

    setEvents([...events, newEvent]);
    setSelectedDates([]);
    setDivision("午前");
    setStartTime("09:00");
    setEndTime("10:00");
  };

  // ✅ イベント削除
  const handleDeleteEvent = (id) => {
    setEvents(events.filter((ev) => ev.id !== id));
  };

  return (
    <div className="page-card">
      <h2 className="page-title">日程登録</h2>
      <p className="page-subtitle">カレンダーから日付を選んでください</p>

      {/* カレンダー */}
      <div className="calendar-container">
        <Calendar
          onClickDay={handleDateClick}
          value={selectedDates[0] || null}
          tileClassName={({ date }) =>
            selectedDates.length > 0 &&
            date.toDateString() === selectedDates[0].toDateString()
              ? "selected-day"
              : ""
          }
        />
      </div>

      {/* 選択した日付 */}
      {selectedDates.length > 0 && (
        <div className="form-group">
          <label>選択した日付:</label>
          <span style={{ marginLeft: "0.5rem", fontWeight: "600" }}>
            {formatDate(selectedDates[0])}
          </span>

          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            {/* 区分プルダウン */}
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
            >
              <option value="午前">午前</option>
              <option value="午後">午後</option>
              <option value="終日">終日</option>
              <option value="時間指定">時間指定</option>
            </select>

            {/* 時間指定用プルダウン */}
            {division === "時間指定" && (
              <>
                <label>開始:</label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
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

          <button
            onClick={handleAddEvent}
            style={{ marginTop: "1rem", display: "block" }}
          >
            追加
          </button>
        </div>
      )}

      {/* イベント一覧 */}
      {events.length > 0 && (
        <div className="event-list">
          <h3>登録済みイベント</h3>
          {events.map((ev) => (
            <div key={ev.id} className="event-card">
              <p>
                📅 {ev.date}
                <br />
                ⏰ {ev.division}
                {ev.division === "時間指定" &&
                  ` (${ev.startTime} ~ ${ev.endTime})`}
              </p>
              <button
                className="delete-btn"
                onClick={() => handleDeleteEvent(ev.id)}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
