import React, { useState } from "react";
import Holidays from "date-holidays";
import "../personal.css";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [events, setEvents] = useState([]);
  const [timeType, setTimeType] = useState("allday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  // 日本時間の今日
  const today = new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });

  // ==== カレンダー生成 ====
  const year = new Date().getFullYear();
  const month = new Date().getMonth(); // 0始まり
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Holidays ライブラリ
  const hd = new Holidays("JP");

  // 日付リスト
  const dates = [];
  for (let i = 1; i <= lastDay.getDate(); i++) {
    dates.push(new Date(year, month, i));
  }

  // 曜日
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  // 日付クリック
  const handleDateClick = (date) => {
    const dateStr = date.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  // 登録処理
  const handleRegister = () => {
    if (!title || selectedDates.length === 0) return;
    const newEvent = {
      id: Date.now(),
      title,
      memo,
      dates: [...selectedDates],
      timeType,
      startTime,
      endTime,
    };
    setEvents([...events, newEvent]);
    setTitle("");
    setMemo("");
    setSelectedDates([]);
    setTimeType("allday");
  };

  return (
    <div className="personal-page">
      <h1 className="page-title">個人日程登録</h1>

      {/* 入力欄 */}
      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力してください"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="memo-input"
        placeholder="メモを入力してください"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      <div className="calendar-list-container">
        {/* 自作カレンダー */}
        <div className="calendar-container">
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
                    if (selectedDates.includes(dateStr)) cellClass += " selected";
                    if (isHoliday) cellClass += " holiday";

                    return (
                      <td
                        key={dow}
                        className={cellClass}
                        onClick={() => handleDateClick(date)}
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

        {/* 右側パネル */}
        <div className="side-panel">
          {/* 選択中の日程 */}
          <div className="selected-dates">
            <h2>選択中の日程</h2>
            {selectedDates.length > 0 ? (
              selectedDates.map((d, i) => (
                <span key={i} className="selected-date-item">
                  {d}
                </span>
              ))
            ) : (
              <p>未選択</p>
            )}
          </div>

          {/* 時間帯指定 */}
          <div className="custom-time">
            <h2>時間帯</h2>
            <select value={timeType} onChange={(e) => setTimeType(e.target.value)}>
              <option value="allday">終日</option>
              <option value="day">昼</option>
              <option value="night">夜</option>
              <option value="custom">時間指定</option>
            </select>

            {timeType === "custom" && (
              <div style={{ marginTop: "10px" }}>
                <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
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
                <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
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

          {/* 登録ボタン */}
          <button className="register-btn" onClick={handleRegister}>
            登録
          </button>

          {/* 登録済み予定 */}
          <div className="events-list">
            <h2>登録済み予定</h2>
            {events.length > 0 ? (
              events.map((ev) => (
                <div key={ev.id}>
                  <p>
                    <strong>{ev.title}</strong> ({ev.dates.join(", ")})
                  </p>
                  <p>{ev.memo}</p>
                  <p>
                    {ev.timeType === "custom"
                      ? `${ev.startTime} ~ ${ev.endTime}`
                      : ev.timeType}
                  </p>
                </div>
              ))
            ) : (
              <p>まだ予定はありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
