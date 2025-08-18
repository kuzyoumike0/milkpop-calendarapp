import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import * as JapaneseHolidays from "japanese-holidays";

export default function CalendarView() {
  const [mode, setMode] = useState("range"); // "range" or "multi"
  const [range, setRange] = useState([new Date(), new Date()]);
  const [multi, setMulti] = useState([]);
  const [slot, setSlot] = useState("終日");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(9);
  const [endTime, setEndTime] = useState(17);
  const [shares, setShares] = useState([]);

  useEffect(() => {
    axios.get("/api/shares").then((res) => setShares(res.data));
  }, []);

  // 日付クリック（複数モード用）
  const handleDateClick = (value) => {
    if (mode === "multi") {
      const exists = multi.find((d) => d.toDateString() === value.toDateString());
      if (exists) {
        setMulti(multi.filter((d) => d.toDateString() !== value.toDateString()));
      } else {
        setMulti([...multi, value]);
      }
    } else {
      setRange(value);
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
        slot,
        title,
        start_time: slot === "時間指定" ? startTime : null,
        end_time: slot === "時間指定" ? endTime : null,
      })
      .then((res) => {
        setShares([...shares, ...res.data]);
        setTitle("");
      });
  };

  // 祝日判定
  const isHoliday = (d) => JapaneseHolidays.isHoliday(d);

  // カレンダーセル装飾
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

  const hours = [...Array(24).keys()];

  return (
    <div style={{ padding: 20 }}>
      <h1>📅 共有カレンダー（範囲/複数日 + 時間指定対応）</h1>

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
        onClickDay={handleDateClick}
        tileContent={tileContent}
        tileClassName={tileClassName}
      />

      <div style={{ marginTop: 20 }}>
        <label>
          区分：
          <select value={slot} onChange={(e) => setSlot(e.target.value)}>
            <option value="終日">終日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
            <option value="時間指定">時間指定</option>
          </select>
        </label>

        {slot === "時間指定" && (
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
            {s.date} [{s.slot}]
            {s.slot === "時間指定" && ` ${s.start_time}:00〜${s.end_time}:00`} - {s.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
