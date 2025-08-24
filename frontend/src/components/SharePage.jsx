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
          fetchResponses(data.id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSchedule();
  }, [token]);

  // 回答一覧取得
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
          user_id: username,
          username,
          responses,
        }),
      });
      if (res.ok) {
        fetchResponses(schedule.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!schedule) return <div>読み込み中...</div>;

  // 出欠データを日付ごとに整形
  const groupByDate = {};
  allResponses.forEach((r) => {
    Object.entries(r.responses).forEach(([date, value]) => {
      if (!groupByDate[date]) groupByDate[date] = [];
      groupByDate[date].push({ user: r.username, value });
    });
  });

  return (
    <div className="page-container">
      <h2 className="page-title">共有スケジュール</h2>

      {/* タイトル */}
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

      {/* 登録した日程一覧をカードにまとめる */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3>日程一覧</h3>
        {schedule.dates.map((d) => (
          <div
            key={d}
            className="selected-date"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* 左: 日付 + 出欠入力 */}
            <div style={{ flex: 1 }}>
              <span style={{ marginRight: "1rem" }}>{d}</span>
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

            {/* 右: 出欠一覧 */}
            <div
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                borderRadius: "8px",
                padding: "0.5rem",
                marginLeft: "1rem",
              }}
            >
              {groupByDate[d] ? (
                groupByDate[d].map((entry, idx) => (
                  <div key={idx}>
                    <strong>{entry.user}</strong>:{" "}
                    {entry.value === "yes" ? "〇" : "✕"}
                  </div>
                ))
              ) : (
                <p style={{ color: "#aaa", margin: 0 }}>未回答</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 保存ボタン（余裕を持たせる） */}
      <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
        <button onClick={handleSave} className="share-button fancy">
          保存する
        </button>
      </div>
    </div>
  );
};

export default SharePage;
