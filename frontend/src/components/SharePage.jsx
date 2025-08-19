import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [mode, setMode] = useState("range"); // "range" or "multi"
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [multiDates, setMultiDates] = useState([]);
  const [timeMode, setTimeMode] = useState("終日"); // "終日" | "昼" | "夜" | "時間指定"
  const [startHour, setStartHour] = useState("01:00");
  const [endHour, setEndHour] = useState("23:59");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  // 日付フォーマット
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // カレンダー選択処理
  const handleDateChange = (val) => {
    if (mode === "range") {
      setDateRange(val);
    } else if (mode === "multi") {
      // 複数選択
      const exists = multiDates.find((d) => formatDate(d) === formatDate(val));
      if (exists) {
        setMultiDates(multiDates.filter((d) => formatDate(d) !== formatDate(val)));
      } else {
        setMultiDates([...multiDates, val]);
      }
    }
  };

  // リンク作成処理
  const handleCreateLink = async () => {
    if (!title) {
      alert("タイトルを入力してください");
      return;
    }

    let dates = [];
    if (mode === "range") {
      const [start, end] = dateRange;
      const d = new Date(start);
      while (d <= end) {
        dates.push(formatDate(d));
        d.setDate(d.getDate() + 1);
      }
    } else {
      dates = multiDates.map((d) => formatDate(d));
    }

    try {
      const res = await axios.post("/api/createLink", {
        dates,
        title,
        timeMode,
        startHour: timeMode === "時間指定" ? startHour : null,
        endHour: timeMode === "時間指定" ? endHour : null,
      });
      setLink(`${window.location.origin}/links/${res.data.linkId}`);
    } catch (err) {
      console.error("リンク作成エラー:", err);
      alert("リンク作成に失敗しました");
    }
  };

  // 時間プルダウン生成
  const hours = [];
  for (let h = 1; h <= 24; h++) {
    const hh = String(h).padStart(2, "0");
    hours.push(`${hh}:00`);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有リンク発行</h2>

      {/* タイトル入力 */}
      <div style={{ marginBottom: "10px" }}>
        <label>タイトル: </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="イベント名を入力"
          style={{ width: "200px" }}
        />
      </div>

      {/* モード切替 */}
      <div style={{ marginBottom: "10px" }}>
        <label>日程選択モード: </label>
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

      {/* カレンダー */}
      <div style={{ marginBottom: "10px" }}>
        <Calendar
          onChange={handleDateChange}
          value={mode === "range" ? dateRange : null}
          selectRange={mode === "range"}
        />
      </div>

      {/* 選択結果 */}
      <div style={{ marginBottom: "10px" }}>
        <strong>選択された日程:</strong>{" "}
        {mode === "range"
          ? `${formatDate(dateRange[0])} 〜 ${formatDate(dateRange[1])}`
          : multiDates.map((d) => formatDate(d)).join(", ")}
      </div>

      {/* 時間帯 */}
      <div style={{ marginBottom: "10px" }}>
        <label>時間帯: </label>
        <select value={timeMode} onChange={(e) => setTimeMode(e.target.value)}>
          <option value="終日">終日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="時間指定">時間指定</option>
        </select>
      </div>

      {/* 時間指定のプルダウン */}
      {timeMode === "時間指定" && (
        <div style={{ marginBottom: "10px" }}>
          <label>開始: </label>
          <select value={startHour} onChange={(e) => setStartHour(e.target.value)}>
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <label style={{ marginLeft: "10px" }}>終了: </label>
          <select value={endHour} onChange={(e) => setEndHour(e.target.value)}>
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* リンク発行ボタン */}
      <button onClick={handleCreateLink}>共有リンクを発行</button>

      {/* 発行結果 */}
      {link && (
        <div style={{ marginTop: "20px" }}>
          <p>共有リンクが発行されました 🎉</p>
          <a href={link} target="_blank" rel="noopener noreferrer">
            {link}
          </a>
        </div>
      )}
    </div>
  );
}
