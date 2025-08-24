import React, { useState, useEffect } from "react";
import "../index.css";

const SharePage = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetch("/api/schedules")
      .then((res) => res.json())
      .then((data) => setSchedules(data))
      .catch((err) => console.error("取得エラー:", err));
  }, []);

  return (
    <div className="page-container">
      <h2 className="page-title">日程共有ページ</h2>

      <div className="main-layout">
        {/* 左カレンダー風枠（将来拡張用） */}
        <div className="calendar-section">
          <div className="calendar dummy-calendar">
            <h3 className="month-title">登録された日程</h3>
            <p>（APIから取得した日程リストは右に表示）</p>
          </div>
        </div>

        {/* 右リスト */}
        <div className="options-section">
          <h3>登録済みリスト</h3>
          {schedules.length === 0 && <p>まだ登録がありません</p>}
          {schedules.map((s) => (
            <div key={s.id} className="selected-date">
              <span>
                {s.title} ({s.dates.join(", ")})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SharePage;
