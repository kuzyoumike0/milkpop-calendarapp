import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [mode, setMode] = useState("range"); // "range" or "multiple"
  const [rangeValue, setRangeValue] = useState([new Date(), new Date()]);
  const [multipleDates, setMultipleDates] = useState([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  // 範囲選択
  const handleRangeChange = (value) => {
    setRangeValue(value);
  };

  // 複数選択
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

  // 保存処理
  const handleSubmit = async () => {
    try {
      let dates;
      if (mode === "range") {
        dates = rangeValue.map((d) => d.toISOString().split("T")[0]);
      } else {
        dates = multipleDates.map((d) => d.toISOString().split("T")[0]);
      }

      await axios.post("/api/shared", {
        username,
        mode,
        dates,
      });

      setMessage("✅ スケジュールを共有しました！");
    } catch (err) {
      console.error(err);
      setMessage("❌ 保存に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール作成</h2>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

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

      {/* 結果 */}
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

      {/* 送信ボタン */}
      <button
        onClick={handleSubmit}
        style={{ marginTop: "20px", padding: "8px 16px" }}
      >
        保存する
      </button>

      {message && <p>{message}</p>}

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
