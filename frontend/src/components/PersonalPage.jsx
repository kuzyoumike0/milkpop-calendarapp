import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const PersonalPage = () => {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("multi"); // "multi" or "range"
  const [timeType, setTimeType] = useState("終日");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");

  const handleSave = async () => {
    const res = await fetch("/api/personal", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        title,
        memo,
        dates: selectedDates,
        options: { type: timeType, start, end }
      })
    });
    const data = await res.json();
    if (data.ok) {
      alert("保存しました！");
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">個人スケジュール登録</h2>

      <label>
        タイトル：
        <input value={title} onChange={e => setTitle(e.target.value)} />
      </label>

      <label>
        メモ：
        <textarea value={memo} onChange={e => setMemo(e.target.value)} />
      </label>

      <div>
        <label>
          <input type="radio" checked={mode==="range"} onChange={() => setMode("range")} />
          範囲選択
        </label>
        <label>
          <input type="radio" checked={mode==="multi"} onChange={() => setMode("multi")} />
          複数選択
        </label>
      </div>

      <Calendar
        selectRange={mode === "range"}
        onChange={(val) => {
          if (mode === "range") {
            setSelectedDates(val);
          } else {
            setSelectedDates([...selectedDates, val]);
          }
        }}
      />

      <div>
        <label><input type="radio" value="終日" checked={timeType==="終日"} onChange={() => setTimeType("終日")} />終日</label>
        <label><input type="radio" value="昼" checked={timeType==="昼"} onChange={() => setTimeType("昼")} />昼</label>
        <label><input type="radio" value="夜" checked={timeType==="夜"} onChange={() => setTimeType("夜")} />夜</label>
        <label>
          <input type="radio" value="時刻指定" checked={timeType==="時刻指定"} onChange={() => setTimeType("時刻指定")} />
          時刻指定
        </label>
        {timeType === "時刻指定" && (
          <>
            <input type="time" value={start} onChange={e => setStart(e.target.value)} />
            〜
            <input type="time" value={end} onChange={e => setEnd(e.target.value)} />
          </>
        )}
      </div>

      <button onClick={handleSave}>保存</button>
    </div>
  );
};

export default PersonalPage;
