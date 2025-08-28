import React, { useState } from "react";
import Holidays from "date-holidays";
import "../register.css";

export default function RegisterPage() {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState({});
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date()); // 表示している月
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [shareUrl, setShareUrl] = useState("");

  // 日本時間の今日
  const today = new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });

  // ==== カレンダー生成 ====
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const hd = new Holidays("JP"); // 日本の祝日
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  // 範囲の日付を配列化
  const getDatesBetween = (start, end) => {
    const dates = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(
        current.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })
      );
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // 日付クリック処理
  const handleDateClick = (date) => {
    const dateStr = date.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });

    if (rangeStart && !rangeEnd) {
      // 範囲終了を設定
      setRangeEnd(date);

      const datesInRange =
        date >= rangeStart
          ? getDatesBetween(rangeStart, date)
          : getDatesBetween(date, rangeStart);

      const updated = { ...selectedDates };
      datesInRange.forEach((d) => {
        updated[d] = {
          timeType: "allday",
          startTime: "09:00",
          endTime: "18:00",
        };
      });
      setSelectedDates(updated);
    } else {
      // 単独選択
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
      setRangeStart(date);
      setRangeEnd(null);
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
    setRangeEnd(null);

    // 仮の共有リンク生成
    const url = `${window.location.origin}/share/${newEvent.id}`;
    setShareUrl(url);
  };

  // 月移動
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

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

        {/* 右パネル */}
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
                      <option value="day">午前</option>
                      <option value="night">午後</option>
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
                    <strong>{ev.title}</strong>
                  </p>
                  {Object.entries(ev.dates).map(([date, setting], j) => {
                    let timeLabel = "";
                    if (setting.timeType === "allday") {
                      timeLabel = "終日";
                    } else if (setting.timeType === "day") {
                      timeLabel = "午前";
                    } else if (setting.timeType === "night") {
                      timeLabel = "午後";
                    } else if (setting.timeType === "custom") {
                      timeLabel = `${setting.startTime} ~ ${setting.endTime}`;
                    }
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

          {/* 共有リンク表示 */}
          {shareUrl && (
            <div className="share-link">
              <p>共有リンク：</p>
              <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                {shareUrl}
              </a>
              <button
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
              >
                コピー
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../register.css";

const hd = new Holidays("JP");

const getTodayJST = () => {
  const now = new Date();
  const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  return jst;
};

const generateCalendar = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks = [];
  let current = new Date(firstDay);
  current.setDate(current.getDate() - current.getDay());

  while (current <= lastDay || current.getDay() !== 0) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
};

const RegisterPage = () => {
  const today = getTodayJST();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [weeks, setWeeks] = useState([]);
  const [mode, setMode] = useState("range");
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [timeSettings, setTimeSettings] = useState({});
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setWeeks(generateCalendar(currentYear, currentMonth));
  }, [currentYear, currentMonth]);

  const isSameDate = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const formatDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  const handleSelect = (date) => {
    const exists = selectedDates.find((d) => isSameDate(d, date));
    if (exists) {
      setSelectedDates(selectedDates.filter((d) => !isSameDate(d, date)));
      return;
    }
    if (mode === "single") {
      setSelectedDates([date]);
    } else if (mode === "multiple") {
      setSelectedDates([...selectedDates, date]);
    } else if (mode === "range") {
      if (selectedDates.length === 0 || selectedDates.length > 1) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const range = [];
        const min = start < date ? start : date;
        const max = start > date ? start : date;
        let cur = new Date(min);
        while (cur <= max) {
          range.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(range);
      }
    }
  };

  const isSelected = (date) =>
    selectedDates.some((d) => isSameDate(d, date));

  const holiday = (date) => {
    const h = hd.isHoliday(date);
    return h ? h[0].name : null;
  };

  const toggleTime = (date, type) => {
    const key = formatDateKey(date);
    setTimeSettings((prev) => {
      const current = prev[key] || {};
      let newActive = {};
      if (type === "時間指定") {
        newActive = { 時間指定: true };
      } else {
        newActive = { [type]: !current.activeTimes?.[type] };
      }
      return { ...prev, [key]: { ...current, activeTimes: newActive } };
    });
  };

  const handleTimeChange = (date, type, value) => {
    const key = formatDateKey(date);
    setTimeSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], [type]: value },
    }));
  };

  const generateShareLink = async () => {
    try {
      const payload = {
        title,
        dates: selectedDates.map((d) => {
          const key = formatDateKey(d);
          const setting = timeSettings[key] || {};
          const activeType =
            setting.showTimeSelect || setting.activeTimes?.["時間指定"]
              ? "時間指定"
              : Object.keys(setting.activeTimes || {}).find((k) => setting.activeTimes[k]) || "終日";

          let startTime = setting.start || null;
          let endTime = setting.end || null;

          if (activeType === "時間指定") {
            if (!startTime) startTime = "09:00";
            if (!endTime) endTime = "18:00";
          }

          return {
            date: key,
            timeType: activeType,
            startTime,
            endTime,
          };
        }),
      };

      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("共有リンク生成失敗");
      const data = await res.json();
      const url = `${window.location.origin}/share/${data.share_token}`;
      setShareUrl(url);
    } catch (err) {
      console.error(err);
      alert("共有リンク生成に失敗しました");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("URLをコピーしました！");
  };

  return (
    <div className="register-page">
      <h1 className="page-title">MilkPOP Calendar</h1>
      <input
        type="text"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="title-input"
      />
      <div className="mode-tabs">
        <button className={mode === "single" ? "active" : ""} onClick={() => setMode("single")}>単日</button>
        <button className={mode === "multiple" ? "active" : ""} onClick={() => setMode("multiple")}>複数選択</button>
        <button className={mode === "range" ? "active" : ""} onClick={() => setMode("range")}>範囲選択</button>
      </div>

      <div className="calendar-container">
        <div className="calendar-box">
          <div className="calendar-header">
            <button onClick={() => setCurrentMonth(currentMonth - 1)}>◀</button>
            <span>{currentYear}年 {currentMonth + 1}月</span>
            <button onClick={() => setCurrentMonth(currentMonth + 1)}>▶</button>
          </div>

          <table className="calendar-table">
            <thead>
              <tr>
                <th className="sunday">日</th>
                <th>月</th>
                <th>火</th>
                <th>水</th>
                <th>木</th>
                <th>金</th>
                <th className="saturday">土</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, i) => (
                <tr key={i}>
                  {week.map((date, j) => {
                    const isToday = isSameDate(date, today);
                    const selected = isSelected(date);
                    const hol = holiday(date);
                    const isCurrentMonth = date.getMonth() === currentMonth;
                    return (
                      <td
                        key={j}
                        className={`cell ${isToday ? "today" : ""} ${selected ? "selected-date" : ""} 
                          ${date.getDay() === 0 ? "sunday" : ""} 
                          ${date.getDay() === 6 ? "saturday" : ""} 
                          ${!isCurrentMonth ? "other-month" : ""}`}
                        onClick={() => isCurrentMonth && handleSelect(date)}
                      >
                        {date.getDate()}
                        {hol && <div className="holiday-name">{hol}</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="selected-list">
          <h2>選択中の日程</h2>
          {[...selectedDates].sort((a, b) => a - b).map((d, idx) => {
            const key = formatDateKey(d);
            const setting = timeSettings[key] || {};
            const active = setting.activeTimes || {};
            return (
              <div key={idx} className="selected-card">
                <span className="date-badge">
                  {d.getFullYear()}-{String(d.getMonth() + 1).padStart(2, "0")}-{String(d.getDate()).padStart(2, "0")}
                </span>
                <div className="time-buttons">
                  {["終日", "午前", "午後"].map((label) => (
                    <button
                      key={label}
                      className={`time-btn ${active[label] ? "active" : ""}`}
                      onClick={() => toggleTime(d, label)}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    className={`time-btn ${active["時間指定"] ? "active" : ""}`}
                    onClick={() => toggleTime(d, "時間指定")}
                  >
                    時間指定
                  </button>
                </div>

                {active["時間指定"] && (
                  <div className="custom-time">
                    <select
                      value={setting.start || "09:00"}
                      onChange={(e) => handleTimeChange(d, "start", e.target.value)}
                    >
                      {Array.from({ length: 24 }).map((_, i) => {
                        const h = String(i).padStart(2, "0");
                        return <option key={i} value={`${h}:00`}>{`${h}:00`}</option>;
                      })}
                    </select>
                    <span>〜</span>
                    <select
                      value={setting.end || "18:00"}
                      onChange={(e) => handleTimeChange(d, "end", e.target.value)}
                    >
                      {Array.from({ length: 24 }).map((_, i) => {
                        const h = String(i).padStart(2, "0");
                        return <option key={i} value={`${h}:00`}>{`${h}:00`}</option>;
                      })}
                    </select>
                  </div>
                )}
              </div>
            );
          })}

          <button className="share-btn" onClick={generateShareLink}>共有リンク発行</button>
          {shareUrl && (
            <div className="share-link-box">
              <a href={shareUrl} target="_blank" rel="noreferrer">{shareUrl}</a>
              <button className="copy-btn" onClick={copyToClipboard}>コピー</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
