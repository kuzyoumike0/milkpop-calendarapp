import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [title, setTitle] = useState(""); // タイトル
  const [selectedDates, setSelectedDates] = useState([]); // 選択済み日付（複数）
  const [message, setMessage] = useState("");

  // 日付を YYYY-MM-DD に整形
  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // カレンダーで日付をクリック
  const handleDateClick = (date) => {
    const dateStr = formatDate(date);
    if (selectedDates.includes(dateStr)) {
      // クリック済みなら解除
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      // 新規選択
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  // リンク作成処理
  const handleCreateLink = async () => {
    if (!title.trim()) {
      setMessage("❌ タイトルを入力してください");
      return;
    }
    if (selectedDates.length === 0) {
      setMessage("❌ 日付を選択してください");
      return;
    }

    try {
      const res = await axios.post("/api/create-link", {
        title,
        dates: selectedDates,
      });
      setMessage(
        `✅ リンク作成成功: https://your-domain.com/link/${res.data.linkId}`
      );
    } catch (err) {
      console.error("リンク作成エラー:", err);
      setMessage("❌ リンク作成に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 共有リンク作成</h2>

      {/* タイトル入力 */}
      <div style={{ marginBottom: "10px" }}>
        <label>タイトル: </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 飲み会調整"
          style={{ padding: "5px", width: "250px" }}
        />
      </div>

      {/* カレンダー（複数日クリック選択対応） */}
      <Calendar onClickDay={handleDateClick} />

      {/* 選択済み日程の表示 */}
      <div style={{ marginTop: "10px" }}>
        <h4>選択済み日程:</h4>
        {selectedDates.length > 0 ? (
          <ul>
            {selectedDates.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        ) : (
          <p>（まだ日付が選択されていません）</p>
        )}
      </div>

      {/* リンク作成ボタン */}
      <button
        onClick={handleCreateLink}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        🔗 共有リンクを作成
      </button>

      {/* メッセージ表示 */}
      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
}
