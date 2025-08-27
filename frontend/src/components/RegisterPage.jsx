// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "react-calendar/dist/Calendar.css";
import "../register.css";

const hd = new Holidays("JP"); // 日本の祝日

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("single"); // single, multiple, range
  const [shareUrl, setShareUrl] = useState("");

  // ===== 日付選択 =====
  const handleDateChange = (date) => {
    if (mode === "single") {
      setSelectedDates([date]);
    } else if (mode === "multiple") {
      setSelectedDates((prev) =>
        prev.some((d) => d.toDateString() === date.toDateString())
          ? prev.filter((d) => d.toDateString() !== date.toDateString())
          : [...prev, date]
      );
    } else if (mode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const start = selectedDates[0];
        const end = date;
        const range = [];
        let current = new Date(start);
        while (current <= end) {
          range.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(range);
      } else {
        setSelectedDates([date]);
      }
    }
  };

  // ===== 共有リンク発行 =====
  const handleShareLink = () => {
    const token = crypto.randomUUID(); // ランダムID生成
    const url = `${window.location.origin}/share/${token}`;
    setShareUrl(url);

    // TODO: バックエンドに schedule 保存API を叩く処理を追加する
    // fetch("/api/schedules", { method: "POST", body: JSON.stringify({title, selectedDates, token}) })
  };

  // ===== 日付タイルの表示調整 =====
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      return (
        <div>
          {/* 祝日名を日付下に表示 */}
          {holiday && <span className="holiday-name">{holiday[0].name}</span>}
        </div>
      );
    }
    return null;
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="register-page">
      <h1 className="page-title">日程登録</h1>

      {/* タイトル入力 */}
      <input
        type="text"
        className="title-input"
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* 選択モード */}
      <div className="mode-tabs">
        <button
          className={mode === "single" ? "active" : ""}
          onClick={() => setMode("single")}
        >
          単日
        </button>
        <button
          className={mode === "multiple" ? "active" : ""}
          onClick={() => setMode("multiple")}
        >
          複数選択
        </button>
        <button
          className={mode === "range" ? "active" : ""}
          onClick={() => setMode("range")}
        >
          範囲選択
        </button>
      </div>

      <div className="calendar-container">
        {/* カレンダー */}
        <div className="calendar-box">
          <Calendar
            onClickDay={handleDateChange}
            value={selectedDates}
            tileContent={tileContent}
            tileClassName={({ date }) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const d = new Date(date);
              d.setHours(0, 0, 0, 0);

              if (selectedDates.some((sel) => sel.toDateString() === d.toDateString())) {
                return "selected-date";
              }
              if (d.getTime() === today.getTime()) {
                return "today";
              }

              // 日曜赤, 土曜青
              if (d.getDay() === 0) return "sunday";
              if (d.getDay() === 6) return "saturday";
              return "";
            }}
          />
        </div>

        {/* 選択中の日程リスト */}
        <div className="selected-list">
          <h3>選択中の日程</h3>
          {selectedDates.map((date, idx) => (
            <div key={idx} className="selected-card">
              <span className="date-badge">{formatDate(date)}</span>
              <div className="time-buttons">
                <button className="time-btn active">終日</button>
                <button className="time-btn">昼</button>
                <button className="time-btn">夜</button>
                <button className="time-btn">時間指定</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 共有リンクボタン */}
      <button className="save-btn" onClick={handleShareLink}>
        共有リンクを発行
      </button>

      {/* 共有リンク表示部分 */}
      {shareUrl && (
        <div className="share-link-box">
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            {shareUrl}
          </a>
          <button
            className="copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              alert("リンクをコピーしました！");
            }}
          >
            コピー
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
