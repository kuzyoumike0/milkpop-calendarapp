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

      // 編集対象の回答を反映
      if (editingUser) {
        const targetResp = data.find((r) => r.username === editingUser);
        setResponses(targetResp ? targetResp.responses : {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 出欠保存
  const handleSave = async () => {
    const targetUser = editingUser || username;
    if (!targetUser) {
      alert("名前を入力してください");
      return;
    }
    try {
      await fetch(`/api/schedules/${schedule.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: targetUser,
          username: targetUser,
          responses,
        }),
      });
      alert(`${targetUser} さんの出欠を保存しました`);
      fetchResponses(schedule.id);
    } catch (err) {
      console.error(err);
    }
  };

  if (!schedule) return <div>読み込み中...</div>;

  // すべてのユーザー名
  const users = [...new Set(allResponses.map((r) => r.username))];

  // 日付ごとの回答を集計
  const groupByDate = {};
  allResponses.forEach((r) => {
    Object.entries(r.responses).forEach(([date, value]) => {
      if (!groupByDate[date]) groupByDate[date] = {};
      groupByDate[date][r.username] = value;
    });
  });

  // 日付＋時間帯表示
  const getDateLabel = (dateStr) => {
    if (typeof dateStr === "string" && dateStr.includes("|")) {
      const [date, time] = dateStr.split("|");
      return `${date} (${time})`;
    }
    return dateStr;
  };

  return (
    <div
      className="page-container"
      style={{ alignItems: "flex-start", maxWidth: "95%", marginLeft: "2rem" }}
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
          onChange={(e) => {
            setUsername(e.target.value);
            setEditingUser(null); // 名前入力時は自分を対象に
            setResponses({});
          }}
          className="title-input"
          style={{ maxWidth: "300px" }}
        />
      </div>

      {/* 日程一覧 */}
      <div
        className="card"
        style={{ marginBottom: "2rem", textAlign: "left", width: "100%" }}
      >
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
              <th style={{ textAlign: "left", padding: "0.5rem 1rem" }}>
                あなたの出欠
              </th>
              <th style={{ textAlign: "left", padding: "0.5rem 1rem" }}>
                みんなの出欠
              </th>
            </tr>
          </thead>
          <tbody>
            {schedule.dates.map((d) => (
              <tr
                key={d}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}
              >
                {/* 日付＋時間帯 */}
                <td style={{ padding: "0.6rem 1rem" }}>
                  <strong>{getDateLabel(d)}</strong>
                </td>

                {/* 出欠プルダウン */}
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

                {/* みんなの出欠（名前クリックで編集対象に） */}
                <td style={{ padding: "0.6rem 1rem" }}>
                  {users.length > 0 ? (
                    users.map((u) => (
                      <span
                        key={u}
                        onClick={() => {
                          setEditingUser(u);
                          const targetResp = allResponses.find(
                            (r) => r.username === u
                          );
                          setResponses(targetResp ? targetResp.responses : {});
                        }}
                        style={{
                          display: "inline-block",
                          marginRight: "0.8rem",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "6px",
                          background:
                            editingUser === u
                              ? "rgba(80,200,120,0.3)"
                              : "rgba(255,255,255,0.1)",
                          color:
                            editingUser === u ? "#50C878" : "#FDB9C8",
                          fontWeight: "bold",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        {u}
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

      {/* 保存ボタン（下にまとめて配置） */}
      <div style={{ marginTop: "1.5rem" }}>
        <button
          onClick={handleSave}
          className="share-button fancy"
          style={{ padding: "0.8rem 1.6rem", fontSize: "1rem" }}
        >
          保存
        </button>
      </div>
    </div>
  );
};

export default SharePage;
