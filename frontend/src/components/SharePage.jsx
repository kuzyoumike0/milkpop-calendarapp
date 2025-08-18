import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SharePage() {
  const [selectMode, setSelectMode] = useState("single"); // single, range, multiple
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [newEvent, setNewEvent] = useState("");
  const [username, setUsername] = useState("");
  const [timeMode, setTimeMode] = useState("preset"); // preset or custom
  const [preset, setPreset] = useState("allday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const navigate = useNavigate();

  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleCalendarChange = (value) => {
    if (selectMode === "single") {
      setSelectedDate(value);
    } else if (selectMode === "range") {
      setSelectedDate(value); // [start, end]
    } else if (selectMode === "multiple") {
      setSelectedDates(Array.isArray(value) ? value : [value]);
    }
  };

  // イベント登録 & 共有リンク発行
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.trim() || !username.trim()) return;

    let dates = [];
    if (selectMode === "single") {
      dates = [formatDate(selectedDate)];
    } else if (selectMode === "range") {
      const [start, end] = selectedDate;
      let cur = new Date(start);
      while (cur <= end) {
        dates.push(formatDate(cur));
        cur.setDate(cur.getDate() + 1);
      }
    } else if (selectMode === "multiple") {
      dates = selectedDates.map((d) => formatDate(d));
    }

    const timeInfo =
      timeMode === "preset"
        ? preset
        : `${startTime}-${endTime}`;

    axios
      .post("/api/shared", {
        dates,
        title: newEvent,
        username,
        timeInfo,
      })
      .then((res) => {
        const linkId = res.data.linkId;
        navigate(`/sharelink/${linkId}`);
      })
      .catch((err) => console.error("イベント登録エラー:", err));
  };

  // 時刻リスト生成
  const timeOptions = Array.from({ length: 24 }, (_, h) =>
    `${String(h).padStart(2, "0")}:00`
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>共有ページ</h1>
      <p style={styles.subtitle}>複数日をまとめて共有リンクに登録できます</p>

      {/* ユーザー名 */}
      <input
        type="text"
        placeholder="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={styles.input}
      />

      {/* カレンダー選択モード */}
      <div style={styles.section}>
        <label>
          <input
            type="radio"
            value="single"
            checked={selectMode === "single"}
            onChange={() => setSelectMode("single")}
          />
          単一日
        </label>
        <label>
          <input
            type="radio"
            value="range"
            checked={selectMode === "range"}
            onChange={() => setSelectMode("range")}
          />
          範囲
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={selectMode === "multiple"}
            onChange={() => setSelectMode("multiple")}
          />
          複数日
        </label>
      </div>

      <Calendar
        selectRange={selectMode === "range"}
        onChange={handleCalendarChange}
        value={selectedDate}
      />

      {/* 区分設定 */}
      <div style={styles.section}>
        <label>
          <input
            type="radio"
            value="preset"
            checked={timeMode === "preset"}
            onChange={() => setTimeMode("preset")}
          />
          区分（終日/昼/夜）
        </label>
        <label>
          <input
            type="radio"
            value="custom"
            checked={timeMode === "custom"}
            onChange={() => setTimeMode("custom")}
          />
          時間指定
        </label>
      </div>

      {timeMode === "preset" ? (
        <select
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
          style={styles.input}
        >
          <option value="allday">終日</option>
          <option value="daytime">昼</option>
          <option value="night">夜</option>
        </select>
      ) : (
        <div style={styles.section}>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={styles.input}
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          〜
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={styles.input}
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      {/* 予定追加フォーム */}
      <form style={styles.form} onSubmit={handleAddEvent}>
        <input
          type="text"
          placeholder="予定を入力"
          value={newEvent}
          onChange={(e) => setNewEvent(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.addButton}>
          共有リンクを発行
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" },
  title: { textAlign: "center", fontSize: "2rem", marginBottom: "10px", color: "#333" },
  subtitle: { textAlign: "center", fontSize: "1rem", marginBottom: "20px", color: "#666" },
  section: { margin: "15px 0", display: "flex", gap: "15px", justifyContent: "center" },
  input: { padding: "8px", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "6px" },
  form: { display: "flex", justifyContent: "center", margin: "20px 0", gap: "10px" },
  addButton: { padding: "8px 16px", background: "#2196F3", color: "white", border: "none", borderRadius: "6px" },
};
