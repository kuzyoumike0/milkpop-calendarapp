// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import "../common.css";
import "../share.css";

const attendanceOptions = ["-", "○", "✖", "△"];
const socket = io();

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [allResponses, setAllResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [userId] = useState(() => crypto.randomUUID());
  const [responses, setResponses] = useState({});
  const [saveMessage, setSaveMessage] = useState("");

  // ===== 編集用 =====
  const [editingCell, setEditingCell] = useState(null);
  const [editedResponses, setEditedResponses] = useState({});

  useEffect(() => {
    if (!token) return;

    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        if (!res.ok) throw new Error("スケジュール取得失敗");
        const data = await res.json();
        setSchedule({ ...data, dates: data.dates || [] });

        const res2 = await fetch(`/api/schedules/${token}/responses`);
        if (!res2.ok) throw new Error("レスポンス取得失敗");
        const data2 = await res2.json();
        setAllResponses(data2);
      } catch (err) {
        console.error("API取得エラー:", err);
      }
    };
    fetchSchedule();

    socket.emit("joinSchedule", token);
    socket.on("updateResponses", (newRes) => {
      setAllResponses((prev) => {
        const others = prev.filter((r) => r.user_id !== newRes.user_id);
        return [...others, newRes];
      });
    });
    socket.on("deleteResponse", ({ user_id }) => {
      setAllResponses((prev) => prev.filter((r) => r.user_id !== user_id));
    });

    return () => {
      socket.off("updateResponses");
      socket.off("deleteResponse");
    };
  }, [token]);

  const handleChange = (dateKey, value) => {
    setResponses((prev) => ({ ...prev, [dateKey]: value }));
  };

  const handleSave = async () => {
    if (!username) {
      setSaveMessage("名前を入力してください");
      return;
    }
    const res = { user_id: userId, username, responses };
    await fetch(`/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(res),
    });
    setSaveMessage("保存しました！");
  };

  const formatDate = (d) => {
    const date = new Date(d.date);
    const base = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    if (d.timeType === "時間指定" && d.startTime && d.endTime) {
      return `${base} (${d.startTime} ~ ${d.endTime})`;
    }
    return `${base}（${d.timeType || "未定"}）`;
  };

  if (!schedule) return <div>読み込み中...</div>;

  // 集計
  const aggregate = {};
  schedule.dates.forEach((d) => {
    const dateKey =
      d.timeType === "時間指定" && d.startTime && d.endTime
        ? `${d.date} (${d.startTime} ~ ${d.endTime})`
        : `${d.date} (${d.timeType})`;
    aggregate[dateKey] = { "○": 0, "✖": 0, "△": 0 };
  });
  allResponses.forEach((row) => {
    Object.entries(row.responses).forEach(([key, status]) => {
      if (aggregate[key] && ["○", "✖", "△"].includes(status)) {
        aggregate[key][status]++;
      }
    });
  });

  return (
    <div className="share-container">
      <h1 className="share-title">MilkPOP Calendar</h1>

      {/* === 自分の回答 === */}
      <div className="my-responses">
        <h2>自分の回答</h2>
        <input
          type="text"
          className="username-input"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="my-responses-list">
          {schedule.dates.map((d) => {
            const dateKey =
              d.timeType === "時間指定" && d.startTime && d.endTime
                ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                : `${d.date} (${d.timeType})`;
            return (
              <div key={dateKey} className="my-response-item">
                <span className="date-label">{formatDate(d)}</span>
                <select
                  className="attendance-select"
                  value={responses[dateKey] || "-"}
                  onChange={(e) => handleChange(dateKey, e.target.value)}
                >
                  {attendanceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
        <button className="save-btn" onClick={handleSave}>
          保存する
        </button>
        {saveMessage && <p className="save-message">{saveMessage}</p>}
      </div>

      {/* === みんなの回答 === */}
      <div className="all-responses">
        <h2>みんなの回答</h2>
        <div className="response-cards">
          {schedule.dates.map((d) => {
            const dateKey =
              d.timeType === "時間指定" && d.startTime && d.endTime
                ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                : `${d.date} (${d.timeType})`;
            return (
              <div key={dateKey} className="response-card">
                <div className="response-date">{formatDate(d)}</div>
                <div className="response-aggregate">
                  <span className="circle">○{aggregate[dateKey]["○"]}</span>
                  <span className="cross">✖{aggregate[dateKey]["✖"]}</span>
                  <span className="triangle">△{aggregate[dateKey]["△"]}</span>
                </div>
                <div className="response-users">
                  {allResponses.map((user) => (
                    <div
                      key={user.user_id}
                      className="user-response"
                      onClick={() => setEditingCell({ user: user.user_id, date: dateKey })}
                    >
                      <span className="user-name">{user.username}</span>
                      {editingCell &&
                      editingCell.user === user.user_id &&
                      editingCell.date === dateKey ? (
                        <select
                          value={
                            editedResponses[user.user_id]?.[dateKey] ||
                            user.responses[dateKey] ||
                            "-"
                          }
                          onChange={(e) =>
                            setEditedResponses((prev) => ({
                              ...prev,
                              [user.user_id]: {
                                ...(prev[user.user_id] || {}),
                                [dateKey]: e.target.value,
                              },
                            }))
                          }
                          onBlur={async () => {
                            await fetch(`/api/schedules/${token}/responses`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                user_id: user.user_id,
                                username: user.username,
                                responses: {
                                  ...user.responses,
                                  ...editedResponses[user.user_id],
                                },
                              }),
                            });
                            setEditingCell(null);
                          }}
                        >
                          {attendanceOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="user-answer">
                          {user.responses[dateKey] || "-"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SharePage;
