import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [timeMode, setTimeMode] = useState("終日");
  const [startHour, setStartHour] = useState("1");
  const [endHour, setEndHour] = useState("24");
  const [linkUrl, setLinkUrl] = useState(null);

  // 日付フォーマット
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 共有リンク発行
  const handleCreateLink = async () => {
    if (!title) {
      alert("タイトルを入力してください");
      return;
    }
    try {
      const res = await axios.post("/api/create-link", {
        date: formatDate(date),
        title,
        timemode: timeMode,
        starthour: timeMode === "時間指定" ? parseInt(startHour) : null,
        endhour: timeMode === "時間指定" ? parseInt(endHour) : null,
      });
      setLinkUrl(`${window.location.origin}/link/${res.data.linkId}`);
    } catch (err) {
      console.error("リンク作成失敗:", err);
      alert("リンク作成に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有リンク発行</h2>

      {/* カレンダー */}
      <div style={{ marginBottom: "15px" }}>
        <Calendar onChange={setDate} value={date} />
      </div>

      {/* タイトル入力 */}
      <div style={{ marginBottom: "15px" }}>
        <label>タイトル: </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "5px", width: "250px" }}
        />
      </div>

      {/* 時間モード */}
      <div style={{ marginBottom: "15px" }}>
        <label>時間帯: </label>
        <select
          value={timeMode}
          onChange={(e) => setTimeMode(e.target.value)}
          style={{ padding: "5px" }}
        >
          <option value="終日">終日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="時間指定">時間指定</option>
        </select>
      </div>

      {/* 時間指定のときだけプルダウン表示 */}
      {timeMode === "時間指定" && (
        <div style={{ marginBottom: "15px" }}>
          <label>開始: </label>
          <select
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
            style={{ padding: "5px", marginRight: "10px" }}
          >
            {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
              <option key={h} value={h}>
                {h}時
              </option>
            ))}
          </select>

          <label>終了: </label>
          <select
            value={endHour}
            onChange={(e) => setEndHour(e.target.value)}
            style={{ padding: "5px" }}
          >
            {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
              <option key={h} value={h}>
                {h}時
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ボタン */}
      <button
        onClick={handleCreateLink}
        style={{ padding: "8px 15px", cursor: "pointer" }}
      >
        共有リンク発行
      </button>

      {/* 発行済みリンク表示 */}
      {linkUrl && (
        <div style={{ marginTop: "20px" }}>
          <p>共有リンク:</p>
          <a href={linkUrl} target="_blank" rel="noopener noreferrer">
            {linkUrl}
          </a>
        </div>
      )}
    </div>
  );
}
