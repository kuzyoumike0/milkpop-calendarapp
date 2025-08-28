import React, { useState } from "react";
import Holidays from "date-holidays";
import "../personal.css";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState({}); // ← 日付ごとのオブジェクト
  const [events, setEvents] = useState([]);

  const today = new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });

  // ==== カレンダー生成 ====
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const hd = new Holidays("JP");

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  // 日付クリック処理
  const handleDateClick = (date) => {
    const dateStr = date.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
    if (selectedDates[dateStr]) {
      // 選択解除
      const updated = { ...selectedDates };
      delete updated[dateStr];
      setSelectedDates(updated);
    } else {
      // デフォルト設定付きで追加
      setSelectedDates({
        ...selectedDates,
        [dateStr]: { timeType: "allday", startTime: "09:00", endTime: "18:00" },
      });
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
      memo,
      dates: { ...selectedDates },
    };
    setEvents([...events, newEvent]);
    setTitle("");
    setMemo("");
    setSelectedDates({});
  };

  return (
    <div className="personal-page">
      <h1 className="page-title">個人日程登録</h1>

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
                    const holidayInfo = hd.isHoliday(date);
                    const isHoliday = holidayInfo && holidayInfo[0];

                    let cellClass = "cell";
                    if (date.getDay() === 0) cellClass += " sunday";
                    if (date.getDay() === 6) cellClass += " saturday";
                    if (dateStr === today) cellClass += " today";
                    if (selectedDates[dateStr]) cellClass += " selected";
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
          <div className="selected-dates">
            <h2>選択中の日程</h2>
            {Object.keys(selectedDates).length > 0 ? (
              Object.entries(selectedDates).map(([dateStr, setting], i) => (
                <div key={i} className="date-setting">
                  <span className="selected-date-item">{dateStr}</span>
                  <div className="custom-time">
                    <select
                      value={setting.timeType}
                      onChange={(e) =>
                        updateTimeSetting(dateStr, "timeType", e.target.value)
                      }
                    >
                      <option value="allday">終日</option>
                      <option value="day">昼</option>
                      <option value="night">夜</option>
                      <option value="custom">時間指定</option>
                    </select>
                    {setting.timeType === "custom" && (
                      <div style={{ marginTop: "5px" }}>
                        <select
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
                  {Object.entries(ev.dates).map(([date, setting], j) => (
                    <p key={j}>
                      {date}：
                      {setting.timeType === "custom"
                        ? `${setting.startTime} ~ ${setting.endTime}`
                        : setting.timeType}
                    </p>
                  ))}
                  <p>{ev.memo}</p>
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
