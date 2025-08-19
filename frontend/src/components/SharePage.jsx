import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function SharePage() {
  const [mode, setMode] = useState("range"); // "range" or "multiple"
  const [rangeValue, setRangeValue] = useState([new Date(), new Date()]);
  const [multipleDates, setMultipleDates] = useState([]);

  // 範囲選択時
  const handleRangeChange = (value) => {
    setRangeValue(value);
  };

  // 複数選択時
  const handleMultipleChange = (date) => {
    const exists = multipleDates.find(
      (d) => d.toDateString() === date.toDateString()
    );
    if (exists) {
      setMultipleDates(multipleDates.filter((d) => d.toDateString() !== date.toDateString()));
    } else {
      setMultipleDates([...multipleDates, date]);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール作成</h2>

      {/* ラジオボタンでモード切替 */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          範囲選択
        </label>
        <label style={{ marginLeft: "15px" }}>
          <input
            type="radio"
            value="multiple"
            checked={mode === "multiple"}
            onChange={() => setMode("multiple")}
          />
          複数選択
        </label>
      </div>

      {/* カレンダー */}
      {mode === "range" ? (
        <Calendar
          selectRange
          onChange={handleRangeChange}
          value={rangeValue}
        />
      ) : (
        <Calendar
          onClickDay={handleMultipleChange}
          tileClassName={({ date }) =>
            multipleDates.find((d) => d.toDateString() === date.toDateString())
              ? "selected-day"
              : ""
          }
        />
      )}

      {/* 選択結果表示 */}
      <div style={{ marginTop: "20px" }}>
        {mode === "range" ? (
          <p>
            選択範囲:{" "}
            {rangeValue[0]?.toLocaleDateString()} 〜{" "}
            {rangeValue[1]?.toLocaleDateString()}
          </p>
        ) : (
          <p>
            選択日:{" "}
            {multipleDates.map((d) => d.toLocaleDateString()).join(", ")}
          </p>
        )}
      </div>

      <style>{`
        .selected-day {
          background: #007bff;
          color: white;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
