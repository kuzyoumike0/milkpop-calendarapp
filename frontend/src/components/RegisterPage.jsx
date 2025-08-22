import React, { useState } from "react";
import Calendar from "react-calendar";
import "../index.css";

const RegisterPage = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [shareLink, setShareLink] = useState("");

  // 日付クリック処理（シンプルに単一日追加型）
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (!selectedDates.includes(dateStr)) {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  // 送信処理
  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: selectedDates }),
      });
      const data = await res.json();
      if (data.id) {
        setShareLink(`${window.location.origin}/share/${data.id}`);
      }
    } catch (err) {
      console.error("送信エラー:", err);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録</h2>
      <div className="register-layout">
        {/* カレンダー */}
        <div className="calendar-section">
          <Calendar onClickDay={handleDateClick} />
        </div>

        {/* 選択済み日程リスト */}
        <div className="schedule-section">
          <h3>選択した日程</h3>
          <ul>
            {selectedDates.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
          <button className="submit-btn" onClick={handleSubmit}>
            共有リンクを作成
          </button>

          {/* 共有リンク表示 */}
          {shareLink && (
            <div className="share-link-box">
              <p>共有リンク:</p>
              <a href={shareLink} target="_blank" rel="noreferrer">
                {shareLink}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
