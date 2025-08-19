import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [username, setUsername] = useState("");
  const [dates, setDates] = useState([]);
  const [mode, setMode] = useState("全日");
  const [linkId, setLinkId] = useState(null);

  // 日付クリックで選択 / 解除
  const toggleDate = (date) => {
    const formatted = date.toISOString().split("T")[0];
    if (dates.includes(formatted)) {
      setDates(dates.filter((d) => d !== formatted));
    } else {
      setDates([...dates, formatted]);
    }
  };

  // 保存処理
  const handleSave = async () => {
    if (!username || dates.length === 0) {
      alert("名前と日付を選択してください");
      return;
    }
    try {
      const res = await axios.post("/api/shared", {
        username,
        dates,
        mode,
      });
      setLinkId(res.data.linkId);
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール作成</h2>

      {/* 名前入力 */}
      <div>
        <label>名前: </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* カレンダー */}
      <div style={{ margin: "20px 0" }}>
        <Calendar onClickDay={toggleDate} />
        <p>選択済みの日付: {dates.join(", ") || "なし"}</p>
      </div>

      {/* 時間帯選択 */}
      <div>
        <label>時間帯: </label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="全日">全日</option>
          <option value="朝">朝</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>

      {/* 保存ボタン */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleSave}>保存して共有リンク発行</button>
      </div>

      {/* 共有リンク表示 */}
      {linkId && (
        <div style={{ marginTop: "20px" }}>
          <p>✅ 共有リンクを発行しました:</p>
          <a
            href={`/shared/${linkId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {window.location.origin}/shared/{linkId}
          </a>
        </div>
      )}
    </div>
  );
}
