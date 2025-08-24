// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState({});
  const [username, setUsername] = useState("");
  const [allResponses, setAllResponses] = useState([]);

  // スケジュール取得
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/share/${token}`);
        const data = await res.json();
        if (!data.error) {
          setSchedule(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSchedule();
  }, [token]);

  // 既存の回答一覧を取得
  const fetchResponses = async (scheduleId) => {
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/responses`);
      const data = await res.json();
      setAllResponses(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 回答送信
  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    try {
      const res = await fetch(`/api/schedules/${schedule.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: username, // 簡易的に名前をID代わり
          username,
          responses,
        }),
      });
      if (res.ok) {
        fetchResponses(schedule.id); // 更新
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!schedule) return <div>読み込み中...</div>;

  return (
    <div className="page-container">
      <h2 className="page-title">共有スケジュール</h2>

      {/* タイトル表示 */}
      <div className="card">
        <h3>{schedule.title}</h3>
      </div>

      {/* 名前入力 */}
      <div className="input-card" style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="あなたの名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="title-input"
        />
      </div>

      {/* 日付ごとの回答フォーム */}
      <div className="options-section">
        <h3>日程に対する出欠を選択</h3>
        {schedule.dates.map((d) => (
          <div key={d} className="selected-date">
            <span>{d}</span>
            <select
              value={responses[d] || ""}
              onChange={(e) =>
                setResponses((prev) => ({ ...prev, [d]: e.target.value }))
              }
              className="custom-dropdown"
            >
              <option value="">選択してください</option>
              <option value="yes">〇 出席</option>
              <option value="no">✕ 欠席</option>
            </select>
          </div>
        ))}
      </div>

      {/* 保存ボタン */}
      <button onClick={handleSave} className="share-button fancy">
        保存する
      </button>

      {/* 回答一覧 */}
      <div className="options-section" style={{ marginTop: "2rem" }}>
        <h3>全員の回答一覧</h3>
        {allResponses.length === 0 ? (
          <p>まだ回答はありません</p>
        ) : (
          allResponses.map((r, idx) => (
            <div key={idx} className="selected-date">
              <strong>{r.username}</strong>
              <pre style={{ margin: 0 }}>
                {JSON.stringify(r.responses, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SharePage;
