import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [mode, setMode] = useState("multiple"); // multiple or range

  // 日付選択ハンドラ
  const handleDateChange = (value) => {
    if (mode === "multiple") {
      setDates(value);
    } else {
      if (Array.isArray(value)) {
        const [start, end] = value;
        if (start && end) {
          const arr = [];
          let d = new Date(start);
          while (d <= end) {
            arr.push(new Date(d));
            d.setDate(d.getDate() + 1);
          }
          setDates(arr);
        }
      }
    }
  };

  // リンク作成処理
  const createLink = async () => {
    try {
      if (!title) {
        alert("タイトルを入力してください");
        return;
      }
      if (!dates || dates.length === 0) {
        alert("日付を選択してください");
        return;
      }

      const formatted = dates.map((d) =>
        new Date(d).toISOString().split("T")[0]
      );
      console.log("送信データ:", { title, dates: formatted });

      const res = await axios.post("/api/create-link", {
        title,
        dates: formatted,
      });

      alert(
        `✅ 共有リンク: ${window.location.origin}/link/${res.data.linkId}`
      );
    } catch (err) {
      console.error("リンク作成エラー", err);
      alert("リンク作成失敗: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 共有リンク作成</h2>

      <div>
        <label>タイトル: </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 飲み会調整"
        />
      </div>

      <div>
        <label>選択モード:</label>
        <label>
          <input
            type="radio"
            checked={mode === "multiple"}
            onChange={() => setMode("multiple")}
          />
          複数選択
        </label>
        <label>
          <input
            type="radio"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          範囲選択
        </label>
      </div>

      <Calendar
        onChange={handleDateChange}
        value={dates}
        selectRange={mode === "range"}
        tileClassName={({ date }) =>
          dates.some((d) => d.toDateString() === date.toDateString())
            ? "selected"
            : ""
        }
      />

      <button onClick={createLink} style={{ marginTop: "20px" }}>
        共有リンクを発行
      </button>

      <style>{`
        .selected {
          background: #4caf50 !important;
          color: white !important;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
