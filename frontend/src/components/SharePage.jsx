import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [title, setTitle] = useState(""); // タイトル
  const [selectedDates, setSelectedDates] = useState([]); // 複数選択日付
  const [shareLink, setShareLink] = useState(""); // 生成されたリンク
  const [message, setMessage] = useState("");

  // 日付を YYYY-MM-DD 形式に整形
  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // カレンダーで日付クリック
  const handleDateClick = (date) => {
    const dateStr = formatDate(date);
    if (selectedDates.includes(dateStr)) {
      // 選択解除
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      // 新規追加
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
      const url = `${window.location.origin}/link/${res.data.linkId}`;
      setShareLink(url);
      setMessage("✅ リンクを作成しました");
    } catch (err) {
      console.error("リンク作成エラー:", err);
      setMessage("❌ リンク作成に失敗しました");
    }
  };

  // 選択済み日付をカレンダー上でハイライト表示
  const tileClassName = ({ date }) => {
    const dateStr = formatDate(date);
    if (selectedDates.includes(dateStr)) {
      return "selected-date"; // CSS クラスで装飾
    }
    return null;
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

      {/* カレンダー（複数日選択 & ハイライト表示対応） */}
      <Calendar onClickDay={handleDateClick} tileClassName={tileClassName} />

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

      {/* メッセージ */}
      {message && <p style={{ marginTop: "10px" }}>{message}</p>}

      {/* 共有リンクを絶対に表示 */}
      {shareLink && (
        <div style={{ marginTop: "15px" }}>
          <p>
            ✅ 共有リンク:{" "}
            <a href={shareLink} target="_blank" rel="noopener noreferrer">
              {shareLink}
            </a>
          </p>
        </div>
      )}

      {/* 選択済み日付のスタイル */}
      <style>{`
        .selected-date {
          background: #4caf50 !important;
          color: white !important;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
