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

      {/* 日程一覧（伝助風のテーブル形式） */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3>日程一覧</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #FDB9C8" }}>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>日付</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>あなたの出欠</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>みんなの出欠一覧</th>
            </tr>
          </thead>
          <tbody>
            {schedule.dates.map((d) => (
              <tr key={d} style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                {/* 左: 日付 */}
                <td style={{ padding: "0.6rem" }}>
                  <strong>{d}</strong>
                </td>

                {/* 中: 自分のプルダウン */}
                <td style={{ padding: "0.6rem" }}>
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
                </td>

                {/* 右: 他ユーザーの出欠 */}
                <td style={{ padding: "0.6rem" }}>
                  {groupByDate[d] ? (
                    groupByDate[d].map((entry, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: "inline-block",
                          marginRight: "0.8rem",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "6px",
                          background:
                            entry.value === "yes"
                              ? "rgba(80,200,120,0.3)"
                              : "rgba(255,100,100,0.3)",
                          color: entry.value === "yes" ? "#50C878" : "#ff4d6d",
                          fontWeight: "bold",
                        }}
                      >
                        {entry.user}: {entry.value === "yes" ? "〇" : "✕"}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "#aaa" }}>未回答</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
