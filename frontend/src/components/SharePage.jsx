// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [username, setUsername] = useState("");
  const [allResponses, setAllResponses] = useState([]);
  const [responses, setResponses] = useState({});
  const [editingUser, setEditingUser] = useState(null); // 編集対象ユーザー

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

      // 編集中のユーザーの回答を state に反映
      if (editingUser) {
        const targetResp = data.find((r) => r.username === editingUser);
        setResponses(targetResp ? targetResp.responses : {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 保存（編集対象ユーザー）
  const handleSave = async () => {
    if (!editingUser) {
      alert("編集するユーザーを選択してください");
      return;
    }
    try {
      await fetch(`/api/schedules/${schedule.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: editingUser,
          username: editingUser,
          responses,
        }),
      });
      alert(`${editingUser} さんの出欠を保存しました`);
      fetchResponses(schedule.id);
    } catch (err) {
      console.error(err);
    }
  };

  // 削除（編集対象ユーザー）
  const handleDelete = async () => {
    if (!editingUser) return;
    if (!window.confirm(`${editingUser} さんの回答を削除しますか？`)) return;

    try {
      await fetch(
        `/api/schedules/${schedule.id}/responses/${encodeURIComponent(editingUser)}`,
        { method: "DELETE" }
      );
      alert(`${editingUser} さんの出欠を削除しました`);
      setEditingUser(null);
      setResponses({});
      fetchResponses(schedule.id);
    } catch (err) {
      console.error(err);
    }
  };

  if (!schedule) return <div>読み込み中...</div>;

  // 日付ごとの回答
  const groupByDate = {};
  allResponses.forEach((r) => {
    Object.entries(r.responses).forEach(([date, value]) => {
      if (!groupByDate[date]) groupByDate[date] = [];
      groupByDate[date].push({ user: r.username, value });
    });
  });

  return (
    <div
      className="page-container"
      style={{
        alignItems: "flex-start",
        maxWidth: "95%",
        margin: "0",
        paddingLeft: "2rem",
      }}
    >
      <h2 className="page-title" style={{ textAlign: "left" }}>
        共有スケジュール
      </h2>

      {/* タイトル */}
      <div
        className="card"
        style={{ textAlign: "left", width: "100%", marginBottom: "1.5rem" }}
      >
        <h3>{schedule.title}</h3>
      </div>

      {/* 名前入力 */}
      <div
        className="input-card"
        style={{ marginBottom: "1.5rem", textAlign: "left", width: "100%" }}
      >
        <input
          type="text"
          placeholder="あなたの名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="title-input"
          style={{ maxWidth: "300px" }}
        />
      </div>

      {/* 日程一覧 */}
      <div className="card" style={{ marginBottom: "2rem", textAlign: "left" }}>
        <h3>日程一覧</h3>
        <table
          style={{
            borderCollapse: "collapse",
            marginTop: "1rem",
            width: "100%",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #FDB9C8" }}>
              <th style={{ textAlign: "left", padding: "0.5rem 1rem" }}>日付</th>
              <th style={{ textAlign: "left", padding: "0.5rem 1rem" }}>あなたの出欠</th>
              <th style={{ textAlign: "left", padding: "0.5rem 1rem" }}>みんなの出欠</th>
            </tr>
          </thead>
          <tbody>
            {schedule.dates.map((d) => (
              <tr
                key={d}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}
              >
                <td style={{ padding: "0.6rem 1rem" }}>
                  <strong>{d}</strong>
                </td>

                {/* あなたの出欠プルダウン */}
                <td style={{ padding: "0.6rem 1rem" }}>
                  <select
                    value={responses[d] || ""}
                    onChange={(e) =>
                      setResponses((prev) => ({ ...prev, [d]: e.target.value }))
                    }
                    className="custom-dropdown"
                    style={{ width: "90px" }}
                  >
                    <option value="">---</option>
                    <option value="yes">〇</option>
                    <option value="maybe">△</option>
                    <option value="no">✕</option>
                  </select>
                </td>

                {/* みんなの出欠（名前をリンク化） */}
                <td style={{ padding: "0.6rem 1rem" }}>
                  {groupByDate[d] ? (
                    groupByDate[d].map((entry, idx) => (
                      <span
                        key={idx}
                        onClick={() => {
                          setEditingUser(entry.user);
                          setResponses(
                            allResponses.find((r) => r.username === entry.user)
                              ?.responses || {}
                          );
                        }}
                        style={{
                          display: "inline-block",
                          marginRight: "0.5rem",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "6px",
                          background: "rgba(255,255,255,0.1)",
                          color: "#FDB9C8",
                          fontWeight: "bold",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        {entry.user}
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

      {/* 編集・削除操作 */}
      {editingUser && (
        <div
          className="card"
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            textAlign: "left",
          }}
        >
          <h3>{editingUser} さんの出欠を編集中</h3>
          <button onClick={handleSave} className="share-button fancy">
            保存
          </button>
          <button
            onClick={handleDelete}
            style={{
              background: "linear-gradient(135deg, #ff4d6d, #ff8080)",
              border: "none",
              borderRadius: "50px",
              padding: "0.8rem 1.6rem",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              marginLeft: "1rem",
            }}
          >
            削除
          </button>
        </div>
      )}
    </div>
  );
};

export default SharePage;
