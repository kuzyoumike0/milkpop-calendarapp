// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import "../index.css";
import Header from "./Header";
import Footer from "./Footer";

const RegisterPage = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [category, setCategory] = useState(""); // 区分
  const [startTime, setStartTime] = useState("1"); // 開始時刻
  const [endTime, setEndTime] = useState("2");   // 終了時刻

  // 時間リスト生成 (1時〜0時)
  const hours = Array.from({ length: 24 }, (_, i) => (i + 1) % 24);

  // 日付クリック処理（サンプル: クリックで日付を選択）
  const handleDateClick = (date) => {
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  return (
    <div className="page-container">
      <Header />

      <main className="page-card">
        {/* ==== ページ見出し ==== */}
        <h2 className="page-title">📅 日程登録</h2>
        <p className="page-subtitle">
          予定を登録して、みんなとスケジュールを共有しましょう
        </p>

        {/* ==== カレンダー ==== */}
        <div className="calendar-wrapper">
          {/* 自作カレンダーや big-calendar をここに設置 */}
          <div
            className="calendar-mock"
            onClick={() => handleDateClick(new Date())}
          >
            [カレンダー表示領域]
          </div>
        </div>

        {/* ==== 選択した日付と区分 ==== */}
        {selectedDate && (
          <div className="form-group">
            <label>選択した日付:</label>
            <span className="selected-date">{selectedDate}</span>

            {/* 区分プルダウン */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ marginLeft: "1rem" }}
            >
              <option value="">区分を選択</option>
              <option value="all-day">終日</option>
              <option value="morning">午前</option>
              <option value="afternoon">午後</option>
              <option value="evening">夜</option>
              <option value="time">時間指定</option>
            </select>

            {/* 時間指定が選ばれた場合に時刻プルダウンを表示 */}
            {category === "time" && (
              <>
                <select
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (parseInt(e.target.value) >= parseInt(endTime)) {
                      setEndTime(String((parseInt(e.target.value) + 1) % 24));
                    }
                  }}
                  style={{ marginLeft: "1rem" }}
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {h}時
                    </option>
                  ))}
                </select>

                <span style={{ margin: "0 0.5rem" }}>〜</span>

                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                >
                  {hours
                    .filter((h) => h > parseInt(startTime))
                    .map((h) => (
                      <option key={h} value={h}>
                        {h}時
                      </option>
                    ))}
                </select>
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;
