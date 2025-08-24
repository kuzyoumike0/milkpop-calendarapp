import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [username, setUsername] = useState("");
  const [allResponses, setAllResponses] = useState([]);
  const [responses, setResponses] = useState({});

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

  // 保存
  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    try {
      await fetch(`/api/schedules/${schedule.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: username,
          username,
          responses,
        }),
      });
      fetchResponses(schedule.id);
    } catch (err) {
      console.error(err);
    }
  };

  // 削除
  const handleDelete = async () => {
    if (!username) return;
    if (!window.confirm("削除しますか？")) return;
    try {
      await fetch(
        `/api/schedules/${schedule.id}/responses/${encodeURIComponent(
          username
        )}`,
        { method: "DELETE" }
      );
      setResponses({});
      fetchResponses(schedule.id);
    } catch (err) {
      console.error(err);
    }
  };

  if (!schedule) return <div>読み込み中...</div>;

  // 日付ごとの出欠データ
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
      style={{ alignItems: "flex-start", maxWidth: "95%", marginLeft: "2rem" }}
    >
      <h2 className="page-title" style={{ textAlign: "left" }}>
        共有スケジュール
      </h2>

      {/* タイトル */}
      <div className="card" style={{ textAlign: "left", width: "100%" }}>
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
          style={{ maxWidth: "400px" }}
        />
      </div>

      {/* 日程一覧 */}
      <div className="card" style={{ marginBottom: "2rem", textAlign: "left" }}>
        <h3>日程一覧</h3>
        <table style={{ width: "100%", marginTop: "1rem" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>日付</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>あなたの出欠</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>ユーザー名</th>
            </tr>
          </thead>
          <tbody>
            {schedule.dates.map((d) => {
              let [date, time] = d.split("|");
              if (!time) time = "終日";
              const entries = groupByDate[d] || [];

              return (
                <tr key={d}>
                  <td style={{ padding: "0.5rem" }}>
                    {date} ({time})
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <select
                      value={responses[d] || ""}
                      onChange={(e) =>
                        setResponses((prev) => ({ ...prev, [d]: e.target.value }))
                      }
                      className="custom-dropdown"
                    >
                      <option value="">---</option>
                      <option value="yes">〇</option>
                      <option value="maybe">△</option>
                      <option value="no">✕</option>
                    </select>
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {entries.length > 0
                      ? entries.map((e, idx) => (
                          <span
                            key={idx}
                            style={{
                              marginRight: "0.5rem",
                              fontWeight: "bold",
                            }}
                          >
                            {e.user}:{" "}
                            {e.value === "yes"
                              ? "〇"
                              : e.value === "maybe"
                              ? "△"
                              : "✕"}
                          </span>
                        ))
                      : "未回答"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 保存・削除 */}
      <div style={{ display: "flex", gap: "1rem" }}>
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
          }}
        >
          削除
        </button>
      </div>
    </div>
  );
};

export default SharePage;
