import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [title, setTitle] = useState(""); // タイトル
  const [selectedDates, setSelectedDates] = useState([]); // 選択日
  const [mode, setMode] = useState("multiple"); // multiple or range
  const [shareLink, setShareLink] = useState("");
  const [message, setMessage] = useState("");

  const [timeslot, setTimeslot] = useState("全日"); // 全日 / 昼 / 夜 / custom
  const [startTime, setStartTime] = useState("1");
  const [endTime, setEndTime] = useState("2");

  // 日付整形
  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 日付クリック
  const handleDateClick = (date) => {
    if (mode === "multiple") {
      const dateStr = formatDate(date);
      if (selectedDates.includes(dateStr)) {
        setSelectedDates(selectedDates.filter((d) => d !== dateStr));
      } else {
        setSelectedDates([...selectedDates, dateStr]);
      }
    } else if (mode === "range") {
      if (selectedDates.length === 0) {
        setSelectedDates([formatDate(date)]);
      } else if (selectedDates.length === 1) {
        const start = new Date(selectedDates[0]);
        const end = date;
        const range = [];
        let current = new Date(start);
        if (start <= end) {
          while (current <= end) {
            range.push(formatDate(current));
            current.setDate(current.getDate() + 1);
          }
        } else {
          while (current >= end) {
            range.push(formatDate(current));
            current.setDate(current.getDate() - 1);
          }
        }
        setSelectedDates(range);
      } else {
        setSelectedDates([formatDate(date)]);
      }
    }
  };

  // リンク作成
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
        timeslot,
        startTime: timeslot === "custom" ? startTime : null,
        endTime: timeslot === "custom" ? endTime : null,
      });
      const url = `${window.location.origin}/link/${res.data.linkId}`;
      setShareLink(url);
      setMessage("✅ リンクを作成しました");
    } catch (err) {
      console.error("リンク作成エラー:", err);
      setMessage("❌ リンク作成に失敗しました");
    }
  };

  // カレンダーハイライト
  const tileClassName = ({ date }) => {
    const dateStr = formatDate(date);
    if (selectedDates.includes(dateStr)) {
      return "selected-date";
    }
    return null;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 共有リンク作成</h2>

      {/* タイトル */}
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

      {/* モード切り替え */}
      <div style={{ marginBottom: "10px" }}>
        <label>選択モード: </label>
        <input
          type="radio"
          value="multiple"
          checked={mode === "multiple"}
          onChange={() => setMode("multiple")}
        />{" "}
        複数選択
        <input
          type="radio"
          value="range"
          checked={mode === "range"}
          onChange={() => setMode("range")}
          style={{ marginLeft: "15px" }}
        />{" "}
        範囲選択
      </div>

      {/* カレンダー */}
      <Calendar onClickDay={handleDateClick} tileClassName={tileClassName} />

      {/* 時間帯選択 */}
      <div style={{ marginTop: "15px" }}>
        <label>時間帯: </label>
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          style={{ padding: "5px" }}
        >
          <option value="全日">全日（終日）</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="custom">時間指定</option>
        </select>

        {timeslot === "custom" && (
          <div style={{ marginTop: "10px" }}>
            <label>開始: </label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}:00
                </option>
              ))}
            </select>

            <label style={{ marginLeft: "10px" }}>終了: </label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}:00
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* リンク作成 */}
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

      {/* リンク表示 */}
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
