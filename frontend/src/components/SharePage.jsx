// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { token } = useParams();
  const [scheduleData, setScheduleData] = useState(null);
  const [responses, setResponses] = useState({});
  const [userName, setUserName] = useState("");

  // データ読み込み
  useEffect(() => {
    if (!token) return;
    const stored = localStorage.getItem(`share_${token}`);
    if (stored) {
      const data = JSON.parse(stored);
      data.dates.sort(); // 日付順にソート
      setScheduleData(data);
    }
  }, [token]);

  const handleSelect = (date, value) => {
    setResponses((prev) => ({
      ...prev,
      [date]: value,
    }));
  };

  const handleSave = () => {
    if (!userName) {
      alert("名前を入力してください");
      return;
    }
    const stored = localStorage.getItem(`share_${token}`);
    if (!stored) return;

    const data = JSON.parse(stored);
    if (!data.responses) data.responses = {};
    data.responses[userName] = responses;

    localStorage.setItem(`share_${token}`, JSON.stringify(data));
    setScheduleData(data);
    alert("保存しました！");
  };

  if (!scheduleData) {
    return (
      <div className="page-container">
        <h2 className="page-title">共有ページ</h2>
        <p>共有データが見つかりません。</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">📢 共有ページ</h2>
      <h3 className="page-subtitle">タイトル: {scheduleData.title}</h3>

      {/* 名前入力 */}
      <div className="input-card">
        <input
          type="text"
          placeholder="あなたの名前を入力"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="title-input"
        />
      </div>

      {/* 日程リスト */}
      <div className="share-schedule-list">
        {scheduleData.dates.map((d) => (
          <div key={d} className="schedule-item">
            <span className="schedule-date">{d}</span>
            <select
              value={responses[d] || ""}
              onChange={(e) => handleSelect(d, e.target.value)}
              className="custom-dropdown"
            >
              <option value="">選択</option>
              <option value="〇">〇</option>
              <option value="✕">✕</option>
            </select>
          </div>
        ))}
      </div>

      {/* 保存ボタン */}
      <button onClick={handleSave} className="share-button fancy">
        保存
      </button>

      {/* 保存済みの出欠表 */}
      {scheduleData.responses && (
        <div className="responses-section">
          <h3>📝 出欠状況</h3>
          <table className="responses-table">
            <thead>
              <tr>
                <th>名前</th>
                {scheduleData.dates.map((d) => (
                  <th key={d}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(scheduleData.responses).map(([name, res]) => (
                <tr key={name}>
                  <td>{name}</td>
                  {scheduleData.dates.map((d) => (
                    <td key={d}>{res[d] || "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SharePage;
