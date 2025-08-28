import React, { useState } from "react";
import Holidays from "date-holidays";
import "../register.css";

export default function RegisterPage() {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState({});
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rangeStart, setRangeStart] = useState(null);
  const [mode, setMode] = useState("single"); // "single" | "multi" | "range"

  const today = new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const hd = new Holidays("JP");
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  // 範囲の日付を配列化
  const getDatesBetween = (start, end) => {
    const dates = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(current.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" }));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // 日付クリック処理
  const handleDateClick = (date) => {
    const dateStr = date.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });

    if (mode === "single") {
      setSelectedDates({
        [dateStr]: { timeType: "allday", startTime: "09:00", endTime: "18:00" },
      });
    }

    if (mode === "multi") {
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
    }

    if (mode === "range") {
      if (rangeStart) {
        const datesInRange =
          date >= rangeStart
            ? getDatesBetween(rangeStart, date)
            : getDatesBetween(date, rangeStart);
        const updated = { ...selectedDates };
        datesInRange.forEach((d) => {
          updated[d] = { timeType: "allday", startTime: "09:00", endTime: "18:00" };
        });
        setSelectedDates(updated);
        setRangeStart(null);
      } else {
        setRangeStart(date);
      }
    }
  };

  // 時間区分変更
  const updateTimeSetting = (dateStr, field, value) => {
    setSelectedDates({
      ...selectedDates,
      [dateStr]: { ...selectedDates[dateStr], [field]: value },
    });
  };

  // 登録処理
  const handleRegister = () => {
    if (!title || Object.keys(selectedDates).length === 0) return;
    const newEvent = {
      id: Date.now(),
      title,
      dates: { ...selectedDates },
    };
    setEvents((prev) => [...prev, newEvent]);
    setTitle("");
    setSelectedDates({});
    setRangeStart(null);
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

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
        <button className={mode === "single" ? "active" : ""} onClick={() => setMode("single")}>
          単日
        </button>
        <button className={mode === "multi" ? "active" : ""} onClick={() => setMode("multi")}>
          複数選択
        </button>
        <button className={mode === "range" ? "active" : ""} onClick={() => setMode("range")}>
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
                    if (dateNum < 1 || dateNum > lastDay.getDate()) return <td key={dow}></td>;

                    const date = new Date(year, month, dateNum);
                    const dateStr = date.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
                    const holidayInfo = hd.isHoliday(date);
                    const isHoliday = holidayInfo && holidayInfo[0];

                    let cellClass = "cell";
                    if (date.getDay() === 0) cellClass += " sunday";
                    if (date.getDay() === 6) cellClass += " saturday";
                    if (dateStr === today) cellClass += " today";
                    if (selectedDates[dateStr]) cellClass += " selected";
                    if (isHoliday) cellClass += " holiday";

                    return (
                      <td key={dow} className={cellClass} onClick={() => handleDateClick(date)}>
                        <div>{dateNum}</div>
                        {isHoliday && <div className="holiday-name">{holidayInfo[0].name}</div>}
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
          <div className="selected-dates">
            <h2>選択中の日程</h2>
            {Object.keys(selectedDates).length > 0 ? (
              Object.entries(selectedDates).map(([dateStr, setting], i) => (
                <div key={i} className="date-card">
                  <span className="date-label">{dateStr}</span>
                  <div className="time-options">
                    <button
                      className={setting.timeType === "allday" ? "active" : ""}
                      onClick={() => updateTimeSetting(dateStr, "timeType", "allday")}
                    >
                      終日
                    </button>
                    <button
                      className={setting.timeType === "day" ? "active" : ""}
                      onClick={() => updateTimeSetting(dateStr, "timeType", "day")}
                    >
                      昼
                    </button>
                    <button
                      className={setting.timeType === "night" ? "active" : ""}
                      onClick={() => updateTimeSetting(dateStr, "timeType", "night")}
                    >
                      夜
                    </button>
                    <button
                      className={setting.timeType === "custom" ? "active" : ""}
                      onClick={() => updateTimeSetting(dateStr, "timeType", "custom")}
                    >
                      時間指定
                    </button>
                  </div>
                  {setting.timeType === "custom" && (
                    <div className="time-range">
                      <select
                        value={setting.startTime}
                        onChange={(e) => updateTimeSetting(dateStr, "startTime", e.target.value)}
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const h = String(i).padStart(2, "0");
                          return (
                            <option key={i} value={`${h}:00`}>
                              {h}:00
                            </option>
                          );
                        })}
                      </select>
                      <span> ~ </span>
                      <select
                        value={setting.endTime}
                        onChange={(e) => updateTimeSetting(dateStr, "endTime", e.target.value)}
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const h = String(i).padStart(2, "0");
                          return (
                            <option key={i} value={`${h}:00`}>
                              {h}:00
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

          <div className="events-list">
            <h2>登録済み予定</h2>
            {events.length > 0 ? (
              events.map((ev) => (
                <div key={ev.id}>
                  <p>
                    <strong>{ev.title}</strong>
                  </p>
                  {Object.entries(ev.dates).map(([date, setting], j) => {
                    let timeLabel = "";
                    if (setting.timeType === "allday") timeLabel = "終日";
                    else if (setting.timeType === "day") timeLabel = "昼";
                    else if (setting.timeType === "night") timeLabel = "夜";
                    else if (setting.timeType === "custom")
                      timeLabel = `${setting.startTime} ~ ${setting.endTime}`;
                    return (
                      <p key={j}>
                        {date}：{timeLabel}
                      </p>
                    );
                  })}
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
