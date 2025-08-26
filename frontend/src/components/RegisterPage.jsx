// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "../register.css";

const hd = new Holidays("JP"); // 日本の祝日対応

export default function RegisterPage() {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeType, setTimeType] = useState("終日");
  const [shareLink, setShareLink] = useState("");

  // 📌 日付クリック処理
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];

    // 既に選択済みなら削除
    if (selectedDates.find((d) => d.date === dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d.date !== dateStr));
    } else {
      setSelectedDates([...selectedDates, { date: dateStr, timeType }]);
    }
  };

  // 📌 モード切替
  const handleModeChange = (mode) => {
    setTimeType(mode);
    // 選択済みにも反映
    setSelectedDates((prev) =>
      prev.map((d) => ({ ...d, timeType: mode }))
    );
  };

  // 📌 共有リンク発行（バックエンドに送信）
  const handleShare = async () => {
    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        dates: selectedDates,
      }),
    });
    const data = await res.json();
    if (data.share_token) {
      setShareLink(`${window.location.origin}/share/${data.share_token}`);
    }
  };

  // 📌 日付表示（祝日・土日対応）
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const weekDay = date.getDay();
    const holiday = hd.isHoliday(date);

    let className = "";
    if (weekDay === 0) className = "sunday"; // 日曜
    if (weekDay === 6) className = "saturday"; // 土曜
    if (holiday) className = "holiday"; // 祝日

    return (
      <div className={className}>
        {holiday && <span className="holiday-name">{holiday[0].name}</span>}
      </div>
    );
  };

  return (
    <div className="register-page">
      <h1 className="page-title">日程登録</h1>
      <div className="register-container">
        {/* カレンダー側 */}
        <div className="calendar-container glass-card">
          {/* タイトル入力をカレンダーの上に */}
          <input
            type="text"
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
          />
          <Calendar
            onClickDay={handleDateClick}
            value={selectedDates.map((d) => new Date(d.date))}
            locale="ja-JP"
            tileContent={tileContent}
            calendarType="gregory"
          />
        </div>

        {/* サイドパネル */}
        <div className="side-panel glass-card">
          {/* モード切替ボタン */}
          <div className="mode-buttons">
            {["終日", "昼", "夜", "時間指定"].map((mode) => (
              <button
                key={mode}
                className={timeType === mode ? "active" : ""}
                onClick={() => handleModeChange(mode)}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* 共有リンク発行 */}
          <button className="share-btn" onClick={handleShare}>
            共有リンク発行
          </button>

          {shareLink && (
            <div className="share-link">
              <a
                href={shareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="share-link-url"
              >
                {shareLink}
              </a>
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  alert("コピーしました！");
                }}
              >
                コピー
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
