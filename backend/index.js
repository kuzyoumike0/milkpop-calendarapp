// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [username, setUsername] = useState("");
  const [allResponses, setAllResponses] = useState([]);
  const [editCell, setEditCell] = useState({}); // {date, user}
  const [newDate, setNewDate] = useState(""); // 追加用

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

  // 出欠保存
  const handleSaveResponse = async (date, value) => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    try {
      const myResponse = allResponses.find((r) => r.user_id === username);
      let responses = {};
      if (myResponse) {
        responses = { ...myResponse.responses, [date]: value };
      } else {
        responses = { [date]: value };
      }

      await fetch(`/api/schedules/${schedule.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: username,
          username,
          responses,
        }),
      });
      setEditCell({});
      fetchResponses(schedule.id);
    } catch (err) {
      console.error(err);
    }
  };

  // 日付追加
  const handleAddDate = async () => {
    if (!newDate) return;
    try {
      const updatedDates = [...schedule.dates, newDate];
      const res = await fetch(`/api/schedules/${schedule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: updatedDates }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSchedule(updated);
        setNewDate("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!schedule) return <div>読み込み中...</div>;

  // ユーザー一覧
  const users = [...new Set(allResponses.map((r) => r.username))];

  // 日付ごとのマッピング
  const dateRows = schedule.dates.map((d) => {
    const row = {};
    users.forEach((u) => {
      const resp = allResponses.find((r) => r.username === u);
      row[u] = resp?.responses?.[d] || "";
    });
    return { date: d, responses: row };
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
      <div
        className="card"
        style={{
          textAlign: "left",
          width: "100%",
          marginLeft: 0, // 👈 左寄せ
        }}
      >
        <h3 style={{ marginLeft: "0.5rem" }}>{schedule.title}</h3>
      </div>

      {/* 名前入力 */}
      <div
        className="input-card"
        style={{
          marginBottom: "1.5rem",
          textAlign: "left",
          width: "100%",
          marginLeft: 0, // 👈 左寄せ
        }}
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

      {/* 日程追加フォーム */}
      <div
        className="input-card"
        style={{
          textAlign: "left",
          width: "100%",
          marginLeft: 0, // 👈 左寄せ
        }}
      >
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="title-input"
          style={{ maxWidth: "200px" }}
        />
        <button
          onClick={handleAddDate}
          className="share-button fancy"
          style={{ marginLeft: "1rem" }}
        >
          日程追加
        </button>
      </div>

      {/* 日程一覧テーブル */}
      <div
        className="card"
        style={{
          marginBottom: "2rem",
          textAlign: "left",
          width: "100%",
          marginLeft: 0, // 👈 左寄せ
        }}
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
            </tr>
          </thead>
          <tbody>
            {dateRows.map((row) => (
              <tr
                key={row.date}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}
              >
                <td style={{ padding: "0.6rem 1rem" }}>
                  <strong>{row.date}</strong>
                </td>
                {users.map((u) => {
                  const value = row.responses[u];
                  const isEditing =
                    editCell.date === row.date && editCell.user === u;
                  return (
                    <td
                      key={u}
                      style={{
                        padding: "0.6rem 1rem",
                        textAlign: "center",
                        cursor: u === username ? "pointer" : "default",
                      }}
                      onClick={() => {
                        if (u === username) setEditCell({ date: row.date, user: u });
                      }}
                    >
                      {isEditing ? (
                        <select
                          defaultValue={value}
                          onChange={(e) =>
                            handleSaveResponse(row.date, e.target.value)
                          }
                          className="custom-dropdown"
                          style={{ width: "80px" }}
                        >
                          <option value="">---</option>
                          <option value="yes">〇</option>
                          <option value="no">✕</option>
                          <option value="maybe">△</option>
                        </select>
                      ) : value === "yes" ? (
                        "〇"
                      ) : value === "no" ? (
                        "✕"
                      ) : value === "maybe" ? (
                        "△"
                      ) : (
                        "-"
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SharePage;
