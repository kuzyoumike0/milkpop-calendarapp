// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import "../index.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [timeRange, setTimeRange] = useState("all-day");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`タイトル: ${title}\n日程: ${dates.join(", ")}\n時間帯: ${timeRange}`);
  };

  return (
    <div className="register-page">
      <h2 className="page-title">📅 日程登録</h2>

      <form className="register-form" onSubmit={handleSubmit}>
        {/* タイトル入力 */}
        <div className="form-group">
          <label htmlFor="title">イベントタイトル</label>
          <input
            type="text"
            id="title"
            placeholder="例: 夏祭り企画"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* カレンダーUI（仮配置） */}
        <div className="form-group">
          <label>日程選択（複数可）</label>
          <div className="calendar-placeholder">
            <p>🗓 カレンダーUIはここに入ります</p>
          </div>
        </div>

        {/* 時間帯選択 */}
        <div className="form-group">
          <label>時間帯</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="all-day">終日</option>
            <option value="day">昼</option>
            <option value="night">夜</option>
            <option value="custom">指定時間</option>
          </select>
        </div>

        {/* 送信ボタン */}
        <button type="submit" className="submit-btn">
          ✅ 登録する
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
