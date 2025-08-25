// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { token } = useParams();
  const [scheduleData, setScheduleData] = useState(null);
  const [responses, setResponses] = useState({});
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch(`/api/schedules/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert("共有リンクが無効です");
        } else {
          data.dates.sort();
          setScheduleData(data);
        }
      });
  }, [token]);

  const handleSelect = (date, value) => {
    setResponses((prev) => ({ ...prev, [date]: value }));
  };

  const handleSave = async () => {
    if (!userName) {
      alert("名前を入力してください");
      return;
    }
    await fetch(`/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userName, username: userName, responses }),
    });
    const updated = await fetch(`/api/schedules/${token}`).then((r) => r.json());
    setScheduleData(updated);
    alert("保存しました！");
  };

  const handleDelete = () => {
    setResponses({});
    alert("選択をリセットしました");
  };

  if (!scheduleData) return <p>読み込み中...</p>;

  return (
    <div className="page-container">
      <h2 className="page-title">共有スケジュール</h2>

      {/* タイトル表示 */}
      <div className="input-card">
        <p className="title-display">{scheduleData.title}</p>
      </div>

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

      {/* 日程一覧 */}
      <div className="input-card">
        <h3>日程一覧</h3>
        {scheduleData.dates.map((d) => {
          const [date, time] = d.split("|");
          return (
            <div key={d} className="schedule-row">
              <span className="schedule-date">{date}</span>
              <span className="schedule-time">({time})</span>
              <select
                value={responses[d] || ""}
                onChange={(e) => handleSelect(d, e.target.value)}
                className="icon-dropdown"
              >
                <option value="">-</option>
                <option value="〇">〇</option>
                <option value="△">△</option>
                <option value="✕">✕</option>
              </select>
            </div>
          );
        })}
      </div>

      {/* ボタン */}
      <div className="button-group spaced">
        <button onClick={handleSave} className="btn-save">保存</button>
        <button onClick={handleDelete} className="btn-delete">削除</button>
      </div>
    </div>
  );
};

export default SharePage;
