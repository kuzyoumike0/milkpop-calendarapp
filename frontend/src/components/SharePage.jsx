import React, { useState } from "react";
import "../index.css";

const SharePage = () => {
  const [schedules, setSchedules] = useState([
    { id: 1, title: "飲み会", date: "2025-09-01" },
    { id: 2, title: "会議", date: "2025-09-03" },
  ]);
  const [responses, setResponses] = useState({});

  const handleResponseChange = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const saveResponses = () => {
    alert("保存しました！（即反映イメージ）");
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程共有ページ</h2>

      <div className="main-layout">
        <div className="calendar-section">
          <div className="calendar dummy-calendar">
            <h3 className="month-title">登録された日程</h3>
            <p>（ここには登録済みのカレンダーUIが表示される想定）</p>
          </div>
        </div>

        <div className="options-section">
          <h3>選択リスト</h3>
          {schedules.map((schedule) => (
            <div key={schedule.id} className="selected-date">
              <span>
                {schedule.title} ({schedule.date})
              </span>
              <select
                value={responses[schedule.id] || ""}
                onChange={(e) =>
                  handleResponseChange(schedule.id, e.target.value)
                }
              >
                <option value="">選択してください</option>
                <option value="yes">〇</option>
                <option value="no">✖</option>
              </select>
            </div>
          ))}
          <button onClick={saveResponses} className="share-button fancy">
            💾 保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
