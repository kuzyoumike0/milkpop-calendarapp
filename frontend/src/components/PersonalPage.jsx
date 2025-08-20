import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import axios from "axios";

export default function PersonalPage() {
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [timeSlot, setTimeSlot] = useState("全日");
  const [schedules, setSchedules] = useState([]);

  const hd = new Holidays("JP"); // 日本の祝日対応

  // === スケジュール取得 ===
  useEffect(() => {
    axios.get("/api/personal").then((res) => setSchedules(res.data));
  }, []);

  // === 選択変更 ===
  const handleDateChange = (value) => {
    if (rangeMode === "multiple") {
      setDates((prev) => {
        const exists = prev.some((d) => d.getTime() === value.getTime());
        return exists ? prev.filter((d) => d.getTime() !== value.getTime()) : [...prev, value];
      });
    } else {
      setDates(value); // 範囲モードは配列として返る
    }
  };

  // === 登録 ===
  const handleSubmit = async () => {
    if (!title || dates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }
    const selectedDates =
      rangeMode === "range"
        ? getDatesBetween(dates[0], dates[1])
        : dates;

    await axios.post("/api/personal", {
      title,
      memo,
      dates: selectedDates,
      timeslot: timeSlot,
      range_mode: rangeMode,
      username: "me", // ユーザー名（仮）
    });

    // 即時反映
    const res = await axios.get("/api/personal");
    setSchedules(res.data);

    // 入力リセット
    setTitle("");
    setMemo("");
    setDates([]);
    setTimeSlot("全日");
  };

  // === 範囲の配列化 ===
  const getDatesBetween = (start, end) => {
    const arr = [];
    let cur = new Date(start);
    while (cur <= end) {
      arr.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return arr;
  };

  // === 祝日判定 ===
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      if (hd.isHoliday(date)) return "holiday";
      if (dates.some((d) => d.getTime() === date.getTime())) return "selected-day";
    }
    return null;
  };

  return (
    <div className="page">
      <header>MilkPOP Calendar</header>

      <div className="container">
        <h2>個人日程登録</h2>

        <label>タイトル</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>メモ</label>
        <input value={memo} onChange={(e) => setMemo(e.target.value)} />

        <label>日程選択モード</label>
        <div>
          <label>
            <input
              type="radio"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={() => setRangeMode("multiple")}
            />
            複数選択
          </label>
          <label style={{ marginLeft: "10px" }}>
            <input
              type="radio"
              value="range"
              checked={rangeMode === "range"}
              onChange={() => setRangeMode("range")}
            />
            範囲選択
          </label>
        </div>

        <Calendar
          onClickDay={handleDateChange}
          value={dates}
          selectRange={rangeMode === "range"}
          tileClassName={tileClassName}
        />

        <label>時間帯</label>
        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="custom">開始時刻〜終了時刻</option>
        </select>

        <button onClick={handleSubmit} style={{ marginTop: "10px", background: "#004CA0", color: "white", padding: "10px 20px" }}>
          登録
        </button>

        <h3>登録済みスケジュール</h3>
        <table>
          <thead>
            <tr>
              <th>タイトル</th>
              <th>メモ</th>
              <th>日程</th>
              <th>時間帯</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td>{s.memo}</td>
                <td>{s.dates.join(", ")}</td>
                <td>{s.timeslot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
