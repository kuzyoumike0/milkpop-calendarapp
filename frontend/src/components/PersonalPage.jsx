import React, { useState } from "react";
import Holidays from "date-holidays";
import "../personal.css";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState({});
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [mode, setMode] = useState("multiple"); // "multiple" | "range"
  const [timeType, setTimeType] = useState("allday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  const hd = new Holidays("JP");

  // === 日本時間の今日 ===
  const todayIso = new Date().toLocaleDateString("sv-SE");

  // === カレンダー生成 ===
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weeks = [];
  let week = [];
  for (let i = 0; i < firstDay.getDay(); i++) week.push(null);

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const d = new Date(year, month, day);
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push(week);

  // === 日付クリック ===
  const handleDateClick = (date) => {
    const iso = date.toLocaleDateString("sv-SE");

    if (mode === "multiple") {
      setSelectedDates((prev) => {
        const newDates = { ...prev };
        if (newDates[iso]) {
          delete newDates[iso];
        } else {
          newDates[iso] = {
            timeType,
            startTime,
            endTime,
          };
        }
        return newDates;
      });
    } else if (mode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
        setRangeEnd(null);
      } else if (rangeStart && !rangeEnd) {
        if (date < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(date);
        } else {
          setRangeEnd(date);
        }
        // 範囲選択完了したら日程保存
        const rangeDates = {};
        let d = new Date(rangeStart);
        while (d <= date) {
          const isoStr = d.toLocaleDateString("sv-SE");
          rangeDates[isoStr] = {
            timeType,
            startTime,
            endTime,
          };
          d.setDate(d.getDate() + 1);
        }
        setSelectedDates((prev) => ({ ...prev, ...rangeDates }));
      } else {
        setRangeStart(date);
        setRangeEnd(null);
      }
    }
  };

  // === モード切替 ===
  const toggleMode = (newMode) => {
    setMode(newMode);
    setRangeStart(null);
    setRangeEnd(null);
  };

  return (
    <div className="personal-page">
      <h1 className="page-title">個人スケジュール登録</h1>

      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="memo-input"
        placeholder="メモを入力"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      {/* モード切替ボタン */}
      <div className="mode-toggle">
        <button
          className={mode === "multiple" ? "active" : ""}
          onClick={() => toggleMode("multiple")}
        >
          複数選択モード
        </button>
        <button
          className={mode === "range" ? "active" : ""}
          onClick={() => toggleMode("range")}
        >
          範囲選択モード
        </button>
      </div>

      {/* 時間帯選択 */}
      <div className="time-options">
        <label>
          <input
            type="radio"
            value="allday"
            checked={timeType === "allday"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          終日
        </label>
        <label>
          <input
            type="radio"
            value="day"
            checked={timeType === "day"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          昼
        </label>
        <label>
          <input
            type="radio"
            value="night"
            checked={timeType === "night"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          夜
        </label>
        <label>
          <input
            type="radio"
            value="custom"
            checked={timeType === "custom"}
            onChange={(e) => setTimeType(e.target.value)}
          />
          時間指定
        </label>
        {timeType === "custom" && (
          <div className="time-range">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            ～
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* カレンダー */}
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
            ←
          </button>
          <span>{year}年 {month + 1}月</span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
            →
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th className="sun">日</th>
              <th>月</th>
              <th>火</th>
              <th>水</th>
              <th>木</th>
              <th>金</th>
              <th className="sat">土</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((d, di) => {
                  if (!d) return <td key={di}></td>;
                  const iso = d.toLocaleDateString("sv-SE");
                  const isToday = iso === todayIso;
                  const holiday = hd.isHoliday(d);
                  const selected = selectedDates[iso];

                  return (
                    <td
                      key={di}
                      className={`${isToday ? "today" : ""} ${
                        holiday ? "holiday" : ""
                      } ${di === 0 ? "sun" : di === 6 ? "sat" : ""} ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() => handleDateClick(d)}
                    >
                      {d.getDate()}
                      {holiday && (
                        <div className="holiday-name">{holiday[0].name}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 選択済み日程リスト */}
      <div className="selected-list">
        <h3>選択した日程</h3>
        <ul>
          {Object.entries(selectedDates).map(([date, info]) => (
            <li key={date}>
              {date} :{" "}
              {info.timeType === "allday"
                ? "終日"
                : info.timeType === "day"
                ? "昼"
                : info.timeType === "night"
                ? "夜"
                : `${info.startTime}～${info.endTime}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
