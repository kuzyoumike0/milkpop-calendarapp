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

  // 保存（新規・編集）
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

  // 削除
  const handleDelete = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      const res = await fetch(
        `/api/schedules/${schedule.id}/responses/${encodeURIComponent(username)}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        setResponses({});
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
    <div
      className="page-container"
      style={{ alignItems: "flex-start", maxWidth: "900px", marginLeft: "2rem" }}
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

      {/* 日程一覧テーブル */}
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
              <th style={{ textAlign: "left", padding: "0.5rem 1rem" }}>参加人数</th>
              <th style={{ textAlign: "left", padding: "0.5rem 1rem" }}>あなたの出欠</th>
              <th style={{ textAlign: "left", padding: "0.5rem 1rem" }}>みんなの出欠</th>
            </tr>
          </thead>
          <tbody>
            {schedule.dates.map((d) => {
              const entries = groupByDate[d] || [];
              const yesCount = entries.filter((e) => e.value === "yes").length;
              const noCount = entries.filter((e) => e.value === "no").length;
              const maybeCount = entries.filter((e) => e.value === "maybe").length;

              return (
                <tr
                  key={d}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}
                >
                  {/* 日付 */}
                  <td style={{ padding: "0.6rem 1rem" }}>
                    <strong>{d}</strong>
                  </td>

                  {/* 人数 */}
                  <td style={{ padding: "0.6rem 1rem" }}>
                    ✅ {yesCount}人 / ❌ {noCount}人 / △ {maybeCount}人
                  </td>

                  {/* あなたの出欠プルダウン */}
                  <td style={{ padding: "0.6rem 1rem" }}>
                    <select
                      value={responses[d] || ""}
                      onChange={(e) =>
                        setResponses((prev) => ({ ...prev, [d]: e.target.value }))
                      }
                      className="custom-dropdown"
                      style={{ width: "120px" }} // 👈 短くした
                    >
                      <option value="">---</option>
                      <option value="yes">〇 出席</option>
                      <option value="no">✕ 欠席</option>
                      <option value="maybe">△ 未定</option>
                    </select>
                  </td>

                  {/* みんなの出欠 */}
                  <td style={{ padding: "0.6rem 1rem" }}>
                    {entries.length > 0 ? (
                      entries.map((entry, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: "inline-block",
                            marginRight: "0.5rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "6px",
                            background:
                              entry.value === "yes"
                                ? "rgba(80,200,120,0.3)"
                                : entry.value === "maybe"
                                ? "rgba(255,215,0,0.3)"
                                : "rgba(255,100,100,0.3)",
                            color:
                              entry.value === "yes"
                                ? "#50C878"
                                : entry.value === "maybe"
                                ? "#FFD700"
                                : "#ff4d6d",
                            fontWeight: "bold",
                          }}
                        >
                          {entry.user}:
                          {entry.value === "yes"
                            ? "〇"
                            : entry.value === "maybe"
                            ? "△"
                            : "✕"}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "#aaa" }}>未回答</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 保存・削除ボタン */}
      <div style={{ marginTop: "2.5rem", display: "flex", gap: "1rem" }}>
        <button onClick={handleSave} className="share-button fancy">
          保存 / 編集
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
