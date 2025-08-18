import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import * as JapaneseHolidays from "japanese-holidays";

export default function CalendarView() {
  const [mode, setMode] = useState("range"); // "range" or "multi"
  const [range, setRange] = useState([new Date(), new Date()]);
  const [multi, setMulti] = useState([]);
  const [slotMode, setSlotMode] = useState("allday"); // "allday" or "time"
  const [slot, setSlot] = useState("終日");
  const [startTime, setStartTime] = useState(9);
  const [endTime, setEndTime] = useState(17);
  const [title, setTitle] = useState("");
  const [shares, setShares] = useState([]);

  useEffect(() => {
    axios.get("/api/shares").then((res) => setShares(res.data));
  }, []);

  // 複数選択モードで日付クリック
  const handleDateClick = (value) => {
    if (mode === "multi") {
      const exists = multi.find((d) => d.toDateString() === value.toDateString());
      if (exists) {
        setMulti(multi.filter((d) => d.toDateString() !== value.toDateString()));
      } else {
        setMulti([...multi, value]);
      }
    }
  };

  // 予定追加
  const addShare = () => {
    let dates = [];
    if (mode === "range") {
      let start = range[0];
      let end = range[1] || range[0];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().slice(0, 10));
      }
    } else {
      dates = multi.map((d) => d.toISOString().slice(0, 10));
    }

    if (!title || dates.length === 0) return;

    axios
      .post("/api/shares", {
        dates,
        slotMode,
        slot: slotMode === "allday" ? slot : null,
        start_time: slotMode === "time" ? startTime : null,
        end_time: slotMode === "time" ? endTime : null,
        title,
      })
      .then((res) => {
        setShares([...shares, ...res.data]);
        setTitle("");
      });
  };

  // 祝日判定
  const isHoliday = (d) => JapaneseHolidays.isHoliday(d);

  // カレンダー装飾
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = isHoliday(date);
      if (holiday) {
        return <span style={{ color: "red", fontSize: "0.7em" }}>{holiday}</span>;
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      if (isHoliday(date)) return "holiday";
      if (date.getDay() === 0) return "sunday";
      if (date.getDay() === 6) return "saturday";
      if (mode === "multi" && multi.some((d) => d.toDateString() === date.toDateString())) {
        return "selected-day";
      }
    }
    return null;
  };

  const hours = [...Array(24).keys()].map((h) => (h === 0 ? 24 : h)); // 1〜24

  return (
    <div style={{ padding: 20 }}>
      <h1>📅 共有カレンダー</h1>

      {/* 範囲 or 複数 */}
      <div>
        <label>
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            value="multi"
            checked={mode === "multi"}
            onChange={() => setMode("multi")}
          />
          複数選択
        </label>
      </div>

      <Calendar
        selectRange={mode === "range"}
        value={mode === "range" ? range : null}
        onChange={(val) => mode === "range" && setRange(val)}
        onClickDay={(val) => handleDateClick(val)}
        tileContent={tileContent}
        tileClassName={tileClassName}
      />

      {/* 区分 */}
      <div style={{ marginTop: 20 }}>
        <label>
          <input
            type="radio"
            value="allday"
            checked={slotMode === "allday"}
            onChange={() => setSlotMode("allday")}
          />
          終日・昼・夜
        </label>
        <label>
          <input
            type="radio"
            value="time"
            checked={slotMode === "time"}
            onChange={() => setSlotMode("time")}
          />
          時間指定
        </label>
      </div>

      {slotMode === "allday" && (
        <select value={slot} onChange={(e) => setSlot(e.target.value)}>
          <option value="終日">終日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      )}

      {slotMode === "time" && (
        <span>
          <select value={startTime} onChange={(e) => setStartTime(parseInt(e.target.value))}>
            {hours.map((h) => (
              <option key={h} value={h}>{h}:00</option>
            ))}
          </select>
          〜
          <select value={endTime} onChange={(e) => setEndTime(parseInt(e.target.value))}>
            {hours.map((h) => (
              <option key={h} value={h}>{h}:00</option>
            ))}
          </select>
        </span>
      )}

      <div>
        <input
          type="text"
          placeholder="予定タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={addShare}>追加</button>
      </div>

      <h2>予定一覧</h2>
      <ul>
        {shares.map((s) => (
          <li key={s.id}>
            {s.date} {s.slotMode === "allday" ? `[${s.slot}]` : `${s.start_time}:00〜${s.end_time}:00`} - {s.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
