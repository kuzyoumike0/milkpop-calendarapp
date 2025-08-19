import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function ShareLinkPage() {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("single"); // "single" or "multiple"
  const [timeSlot, setTimeSlot] = useState("終日");
  const [startHour, setStartHour] = useState("1");
  const [endHour, setEndHour] = useState("24");
  const [link, setLink] = useState("");

  // 日付フォーマット
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // カレンダー選択
  const handleDateChange = (date) => {
    if (mode === "single") {
      setSelectedDates([date]);
    } else {
      if (!Array.isArray(selectedDates)) {
        setSelectedDates([date]);
        return;
      }
      const exists = selectedDates.find((d) => formatDate(d) === formatDate(date));
      if (exists) {
        setSelectedDates(selectedDates.filter((d) => formatDate(d) !== formatDate(date)));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    }
  };

  // リンク発行
  const handleSubmit = async () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日程を入力してください");
      return;
    }

    try {
      const formattedDates = selectedDates.map((d) => formatDate(d));

      const res = await axios.post("/api/create-link", {
        title,
        dates: formattedDates,
        timeSlot,
        startHour,
        endHour,
      });

      if (res.data.linkId) {
        const newLink = `${window.location.origin}/share/${res.data.linkId}`;
        setLink(newLink);
      } else {
        alert("リンク作成に失敗しました");
      }
    } catch (err) {
      console.error("リンク作成エラー:", err);
      alert("リンク作成に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>日程共有リンク発行ページ</h2>

      {/* タイトル入力 */}
      <div>
        <label>タイトル: </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="イベント名を入力"
        />
      </div>

      {/* モード切り替え */}
      <div>
        <label>
          <input
            type="radio"
            value="single"
            checked={mode === "single"}
            onChange={() => setMode("single")}
          />
          単日選択
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={mode === "multiple"}
            onChange={() => setMode("multiple")}
          />
          複数日選択
        </label>
      </div>

      {/* カレンダー */}
      <Calendar onClickDay={handleDateChange} />

      {/* 選択済み日程 */}
      <div>
        <h4>選択した日程:</h4>
        <ul>
          {selectedDates.map((d, i) => (
            <li key={i}>{formatDate(d)}</li>
          ))}
        </ul>
      </div>

      {/* 時間帯指定 */}
      <div>
        <label>時間帯: </label>
        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          <option value="終日">終日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="時間指定">時間指定</option>
        </select>
      </div>

      {/* 時間指定 */}
      {timeSlot === "時間指定" && (
        <div>
          <label>開始時刻: </label>
          <select value={startHour} onChange={(e) => setStartHour(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
              <option key={h} value={h}>{h}時</option>
            ))}
          </select>
          <label>終了時刻: </label>
          <select value={endHour} onChange={(e) => setEndHour(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
              <option key={h} value={h}>{h}時</option>
            ))}
          </select>
        </div>
      )}

      {/* 発行ボタン */}
      <div>
        <button onClick={handleSubmit}>リンク発行</button>
      </div>

      {/* 発行結果 */}
      {link && (
        <div>
          <p>発行されたリンク:</p>
          <a href={link} target="_blank" rel="noopener noreferrer">
            {link}
          </a>
        </div>
      )}
    </div>
  );
}
