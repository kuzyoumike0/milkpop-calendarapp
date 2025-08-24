// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [allResponses, setAllResponses] = useState([]);
  const [responses, setResponses] = useState({});
  const [username, setUsername] = useState("");

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
      alert("保存しました");
      fetchResponses(schedule.id);
    } catch (err) {
      console.error(err);
    }
  };

  if (!schedule) return <div>読み込み中...</div>;

  // すべてのユーザー名
  const users = [...new Set(allResponses.map((r) => r.username))];

  // 日付ごとの回答マッピング
  const dateRows = schedule.dates.map((d) => {
    const row = {};
    users.forEach((u) => {
      const resp = allResponses.find((r) => r.username === u);
      row[u] = resp?.responses?.[d] || "";
    });
    return { date: d, responses: row };
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
          onChange={(e) => setUsername(e.target.value)}
          className="title-input"
          style={{ maxWidth: "300px" }}
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
              {users.map((u) => (
                <th
                  key={u}
                  style={{ textAlign: "center", padding: "0.5rem 1rem" }}
                >
                  {u}
                </th>
              ))}
              {!users.includes(username) && username && (
                <th style={{ textAlign: "center", padding: "0.5rem 1rem" }}>
                  {username}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {dateRows.map((row) => (
              <tr
                key={row.date}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}
              >
                {/* 日付＋時間帯 */}
                <td style={{ padding: "0.6rem 1rem" }}>
                  <strong>{getDateLabel(row.date)}</strong>
                </td>

                {/* 既存ユーザーの出欠 */}
                {users.map((u) => (
                  <td
                    key={u}
                    style={{
                      padding: "0.6rem 1rem",
                      textAlign: "center",
                    }}
                  >
                    {row.responses[u] === "yes"
                      ? "〇"
                      : row.responses[u] === "no"
                      ? "✕"
                      : row.responses[u] === "maybe"
                      ? "△"
                      : "-"}
                  </td>
                ))}

                {/* 自分用プルダウン（初期表示あり） */}
                {!users.includes(username) && username && (
                  <td style={{ padding: "0.6rem 1rem", textAlign: "center" }}>
                    <select
                      value={responses[row.date] || ""}
                      onChange={(e) =>
                        setResponses((prev) => ({
                          ...prev,
                          [row.date]: e.target.value,
                        }))
                      }
                      className="custom-dropdown"
                      style={{ width: "80px" }}
                    >
                      <option value="">---</option>
                      <option value="yes">〇</option>
                      <option value="maybe">△</option>
                      <option value="no">✕</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 保存ボタン */}
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
