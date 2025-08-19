import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("multiple"); // multiple or range
  const [shareLink, setShareLink] = useState("");
  const [message, setMessage] = useState("");
  const [timeslot, setTimeslot] = useState("全日");

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 日付選択（モードに応じて処理）
  const handleDateSelect = (date) => {
    if (mode === "multiple") {
      const dateStr = formatDate(date);
      if (selectedDates.includes(dateStr)) {
        setSelectedDates(selectedDates.filter((d) => d !== dateStr));
      } else {
        setSelectedDates([...selectedDates, dateStr]);
      }
    } else if (mode === "range" && Array.isArray(date)) {
      const [start, end] = date;
      if (start && end) {
        const range = [];
        let current = new Date(start);
        while (current <= end) {
          range.push(formatDate(current));
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(range);
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
      });
      const url = `${window.location.origin}/link/${res.data.linkId}`;
      setShareLink(url);
      setMessage("✅ リンクを作成しました");
    } catch (err) {
      console.error("リンク作成エラー:", err);
      setMessage("❌ リンク作成に失敗しました");
    }
  };

  const tileClassName = ({ date }) => {
    const dateStr = formatDate(date);
    if (selectedDates.includes(dateStr)) return "selected-date";
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

      {/* モード切替 */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={mode === "multiple"}
            onChange={() => setMode("multiple")}
          />
          複数日クリック
        </label>
        <label style={{ marginLeft: "15px" }}>
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          範囲選択
        </label>
      </div>

      {/* 時間帯プルダウン */}
      <div style={{ marginBottom: "10px" }}>
        <label>時間帯: </label>
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          style={{ padding: "5px" }}
        >
          <option value="全日">全日（終日）</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
        </select>
      </div>

      {/* カレンダー */}
      <Calendar
        selectRange={mode === "range"}
        onChange={handleDateSelect}
        onClickDay={mode === "multiple" ? handleDateSelect : undefined}
        tileClassName={tileClassName}
      />

      <button
        onClick={handleCreateLink}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
        }}
      >
        🔗 共有リンクを作成
      </button>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}

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
