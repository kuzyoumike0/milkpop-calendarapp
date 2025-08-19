import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState("全日");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  // 日付フォーマット
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 共有リンク発行処理
  const handleCreateLink = async () => {
    if (!title) {
      alert("タイトルを入力してください");
      return;
    }

    try {
      const res = await axios.post("/api/createLink", {
        date: formatDate(date),
        timeSlot,
        title,
      });
      setLink(`${window.location.origin}/links/${res.data.linkId}`);
    } catch (err) {
      console.error("リンク作成エラー:", err);
      alert("リンク作成に失敗しました");
    }
  };

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

      {/* カレンダー */}
      <div style={{ marginBottom: "10px" }}>
        <label>日付: </label>
        <Calendar onChange={setDate} value={date} />
      </div>

      {/* 時間帯 */}
      <div style={{ marginBottom: "10px" }}>
        <label>時間帯: </label>
        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>

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
