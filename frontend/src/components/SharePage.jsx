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

  if (!schedule) return <div>読み込み中...</div>;

  // ユーザー一覧
  const users = [...new Set(allResponses.map((r) => r.username))];

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
      <div className="input-card" style={{ textAlign: "left", width: "100%" }}>
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
      <div className="card" style={{ textAlign: "left", width: "100%" }}>
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
                <th key={u} style={{ textAlign: "center", padding: "0.5rem 1rem" }}>
                  {u}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.dates.map((d) => {
              let [date, time] = d.split("|");
              if (!time) time = "終日";

              return (
                <tr key={d} style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                  {/* 日付 + 時間帯 */}
                  <td style={{ padding: "0.6rem 1rem" }}>
                    <strong>{date}</strong> （{time}）
                  </td>

                  {users.map((u) => {
                    const userResp = allResponses.find((r) => r.username === u);
                    const value = userResp?.responses?.[d] || "";

                    if (u === username) {
                      return (
                        <td key={u} style={{ textAlign: "center" }}>
                          <select
                            value={responses[d] || value || ""}
                            onChange={(e) =>
                              setResponses((prev) => ({ ...prev, [d]: e.target.value }))
                            }
                            className="custom-dropdown"
                            style={{ width: "80px" }}
                          >
                            <option value="">---</option>
                            <option value="yes">〇</option>
                            <option value="no">✕</option>
                            <option value="maybe">△</option>
                          </select>
                        </td>
                      );
                    } else {
                      return (
                        <td key={u} style={{ textAlign: "center" }}>
                          {value === "yes"
                            ? "〇"
                            : value === "no"
                            ? "✕"
                            : value === "maybe"
                            ? "△"
                            : "-"}
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 保存ボタン */}
      <div style={{ marginTop: "2rem" }}>
        <button onClick={handleSave} className="share-button fancy">
          保存
        </button>
      </div>
    </div>
  );
};

export default SharePage;
