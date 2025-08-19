import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const [dates, setDates] = useState([]); // 複数日対応
  const [mode, setMode] = useState("single"); // single / multiple
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("終日");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [shareLink, setShareLink] = useState("");

  // 日付選択ハンドラ
  const handleDateChange = (d) => {
    if (mode === "single") {
      setDates([d]);
    } else {
      // multiple
      const exists = dates.find(
        (x) => new Date(x).toDateString() === d.toDateString()
      );
      if (exists) {
        setDates(dates.filter((x) => new Date(x).toDateString() !== d.toDateString()));
      } else {
        setDates([...dates, d]);
      }
    }
  };

  // 予定登録 & 共有リンク発行
  const handleShare = async () => {
    if (!username || !title || dates.length === 0) {
      alert("入力が不足しています");
      return;
    }

    const formattedDates = dates.map((d) =>
      d.toISOString().split("T")[0]
    );

    try {
      const res = await axios.post("/api/shared", {
        username,
        title,
        dates: formattedDates,
        category,
        startTime: startTime || null,
        endTime: endTime || null,
      });
      setShareLink(`${window.location.origin}/share/${res.data.linkId}`);
    } catch (err) {
      console.error(err);
      alert("共有リンクの作成に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有ページ</h2>

      <div>
        <label>名前: </label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div>
        <label>予定タイトル: </label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label>モード: </label>
        <label>
          <input
            type="radio"
            checked={mode === "single"}
            onChange={() => setMode("single")}
          />
          単日
        </label>
        <label>
          <input
            type="radio"
            checked={mode === "multiple"}
            onChange={() => setMode("multiple")}
          />
          複数選択
        </label>
      </div>

      <Calendar
        onClickDay={handleDateChange}
        value={dates}
        selectRange={false}
      />

      <div>
        <label>区分: </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="終日">終日</option>
          <option value="昼">昼（13:00-18:00）</option>
          <option value="夜">夜（21:00-0:00）</option>
          <option value="時間指定">時間指定</option>
        </select>
      </div>

      {category === "時間指定" && (
        <div>
          <label>開始: </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <label>終了: </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      )}

      <button onClick={handleShare}>共有リンクを発行</button>

      {shareLink && (
        <div>
          <p>共有リンク: <a href={shareLink}>{shareLink}</a></p>
        </div>
      )}
    </div>
  );
}
