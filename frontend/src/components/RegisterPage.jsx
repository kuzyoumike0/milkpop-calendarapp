// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Holidays from "date-holidays";
import "../index.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [timeOptions, setTimeOptions] = useState({});
  const [customTimes, setCustomTimes] = useState({});
  const [shareUrl, setShareUrl] = useState("");

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const hd = new Holidays("JP");

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const hours = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, "0")}:00`
  );

  const handleDateClick = (date) => {
    if (selectionMode === "multiple") {
      setSelectedDates((prev) =>
        prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
      );
    } else {
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        let start = new Date(selectedDates[0]);
        let end = new Date(date);
        if (end < start) [start, end] = [end, start];
        const range = [];
        const cur = new Date(start);
        while (cur <= end) {
          range.push(cur.toISOString().split("T")[0]);
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(range);
      } else {
        setSelectedDates([date]);
      }
    }
  };

  const handleShare = async () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }

    const formattedDates = selectedDates.map((d) => {
      if (timeOptions[d] === "custom") {
        const start = customTimes[d]?.start || "00:00";
        const end = customTimes[d]?.end || "23:59";
        return `${d}|${start}-${end}`;
      }
      return `${d}|${timeOptions[d] || "終日"}`;
    });

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dates: formattedDates }),
      });
      const data = await res.json();
      if (data.share_token) {
        setShareUrl(`${window.location.origin}/share/${data.share_token}`);
      } else {
        alert("共有リンクの生成に失敗しました");
      }
    } catch (err) {
      console.error(err);
      alert("サーバーエラー");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("コピーしました！");
    });
  };

  return (
    <div className="page-container">
      <h2 className="page-title">📅 日程登録ページ</h2>
      <input
        type="text"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="title-input"
      />

      {/* カレンダー（省略: 以前のまま） */}

      <button onClick={handleShare} className="share-button fancy">
        🔗 共有リンクを発行
      </button>

      {shareUrl && (
        <div className="share-link">
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            {shareUrl}
          </a>
          <button onClick={copyToClipboard} className="copy-btn">
            コピー
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
