// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import CalendarWithHolidays from "./CalendarWithHolidays";
import "../index.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [shareUrl, setShareUrl] = useState("");

  // 日付クリック処理（選択/解除切り替え）
  const handleSelectDate = (date) => {
    const exists = selectedDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
    if (exists) {
      setSelectedDates(
        selectedDates.filter((d) => d.toDateString() !== date.toDateString())
      );
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  // 登録処理（仮：共有リンク生成）
  const handleRegister = () => {
    if (!title || selectedDates.length === 0) return;

    const url = `${window.location.origin}/share/${Math.random()
      .toString(36)
      .substring(2, 8)}`;
    setShareUrl(url);
  };

  return (
    <main className="page-card">
      <h2 className="page-title">📅 日程登録ページ</h2>

      {/* 入力フォーム */}
      <div className="form-group">
        <label>タイトル:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 打ち合わせ"
        />
      </div>

      {/* おしゃれ祝日カレンダー */}
      <CalendarWithHolidays onSelectDate={handleSelectDate} />

      {/* 選択した日付リスト */}
      <div className="selected-dates">
        <h3>選択した日付:</h3>
        <ul>
          {selectedDates.map((d, idx) => (
            <li key={idx}>{d.toLocaleDateString("ja-JP")}</li>
          ))}
        </ul>
      </div>

      {/* 登録ボタン */}
      <button onClick={handleRegister}>登録</button>

      {/* 共有リンク */}
      {shareUrl && (
        <div className="share-link">
          <p>✅ 共有リンクが発行されました:</p>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            {shareUrl}
          </a>
        </div>
      )}
    </main>
  );
};

export default RegisterPage;
