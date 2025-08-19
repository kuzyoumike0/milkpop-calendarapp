import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("range");
  const [timeSlot, setTimeSlot] = useState("終日");
  const [startHour, setStartHour] = useState(1);
  const [endHour, setEndHour] = useState(24);

  return (
    <div>
      <h2>✍ 個人日程登録ページ</h2>

      <div>
        <label>タイトル: </label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>メモ: </label>
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} />
      </div>

      <div style={{ marginTop: "10px" }}>
        <Calendar value={date} onChange={setDate} />
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          範囲選択
        </label>
        <label style={{ marginLeft: "10px" }}>
          <input
            type="radio"
            value="multi"
            checked={mode === "multi"}
            onChange={() => setMode("multi")}
          />
          複数選択
        </label>
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>時間帯: </label>
        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          <option value="終日">終日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="時間指定">時間指定</option>
        </select>
        {timeSlot === "時間指定" && (
          <span>
            {" "}
            <select value={startHour} onChange={(e) => setStartHour(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}時</option>
              ))}
            </select>
            ~
            <select value={endHour} onChange={(e) => setEndHour(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}時</option>
              ))}
            </select>
          </span>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>✅ 登録プレビュー</h3>
        <p><b>タイトル:</b> {title}</p>
        <p><b>メモ:</b> {memo}</p>
        <p><b>日付:</b> {date.toLocaleDateString()}</p>
        <p><b>時間帯:</b> {timeSlot}{timeSlot === "時間指定" && ` ${startHour}時〜${endHour}時`}</p>
      </div>
    </div>
  );
}
