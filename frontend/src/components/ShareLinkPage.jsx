import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [mode, setMode] = useState("range");
  const [rangeValue, setRangeValue] = useState([new Date(), new Date()]);
  const [multipleDates, setMultipleDates] = useState([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const handleRangeChange = (value) => {
    setRangeValue(value);
  };

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

  const handleSubmit = async () => {
    try {
      let dates;
      if (mode === "range") {
        dates = rangeValue.map((d) => d.toISOString().split("T")[0]);
      } else {
        dates = multipleDates.map((d) => d.toISOString().split("T")[0]);
      }

      const res = await axios.post("/api/shared", {
        username,
        mode,
        dates,
      });

      const { linkId } = res.data;
      const link = `${window.location.origin}/share/${linkId}`;
      setMessage(`✅ 共有リンクを発行しました: ${link}`);
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
