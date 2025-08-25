// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import "../common.css";
import "../share.css";

const attendanceOptions = ["-", "○", "✖", "△"];
const socket = io(); // デフォルト接続

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [allResponses, setAllResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [userId] = useState(() => crypto.randomUUID()); // ローカル一時ID
  const [users, setUsers] = useState([]);
  const [responses, setResponses] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // ===== スケジュール読み込み =====
  useEffect(() => {
    const fetchSchedule = async () => {
      const res = await fetch(`/api/schedules/${token}`);
      const data = await res.json();
      if (!data.error) {
        setSchedule(data);

        // 初期レスポンス
        const init = {};
        data.dates.forEach((d) => {
          const key =
            d.time === "時間指定" && d.startTime && d.endTime
              ? `${d.date} (${d.startTime} ~ ${d.endTime})`
              : `${d.date} (${d.time})`;
          init[key] = "-";
        });
        setResponses(init);
      }
    };
    fetchSchedule();
  }, [token]);

  // ===== 回答一覧取得 =====
  const fetchResponses = async () => {
    const res = await fetch(`/api/schedules/${token}/responses`);
    const data = await res.json();
    if (!data.error) {
      setAllResponses(data);
      setUsers(data.map((r) => r.username));
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [token]);

  // ===== Socket.IO =====
  useEffect(() => {
    socket.emit("joinSchedule", token);

    socket.on("updateResponses", (data) => {
      setAllResponses((prev) => {
        const filtered = prev.filter((r) => r.user_id !== data.user_id);
        return [...filtered, data];
      });
    });

    return () => {
      socket.off("updateResponses");
    };
  }, [token]);

  // ===== 新規追加 =====
  const handleAddUser = () => {
    if (!username) {
      alert("名前を入力してください！");
      return;
    }
    if (!users.includes(username)) {
      setUsers((prev) => [...prev, username]);
      setIsEditing(true);
    }
  };

  // ===== 出欠クリック変更（即表反映） =====
  const handleSelect = (key, value) => {
    setResponses((prev) => {
      const updated = { ...prev, [key]: value };

      // 表を即時更新
      setAllResponses((prevAll) => {
        const existing = prevAll.find((r) => r.user_id === userId);
        if (existing) {
          return prevAll.map((r) =>
            r.user_id === userId ? { ...r, responses: updated } : r
          );
        } else {
          return [...prevAll, { user_id: userId, username, responses: updated }];
        }
      });

      return updated;
    });
  };

  // ===== 保存（サーバーへ送信） =====
  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください！（必須）");
      return;
    }
    try {
      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          username,
          responses,
        }),
      });
      setIsEditing(false);
    } catch (err) {
      console.error("保存エラー", err);
    }
  };

  if (!schedule) return <div className="share-page">読み込み中...</div>;

  return (
    <div className="share-page">
      <h2 className="page-title">共有スケジュール</h2>

      <div className="glass-black title-box">{schedule.title}</div>

      <div className="glass-black name-box">
        <input
          type="text"
          placeholder="あなたの名前を入力（必須）"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button className="add-button" onClick={handleAddUser}>
          新規追加
        </button>
      </div>

      <div className="glass-black schedule-list">
        <table>
          <thead>
            <tr>
              <th>日付</th>
              <th>時間</th>
              {users.map((u, idx) => (
                <th key={idx}>{u}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.dates.map((d, i) => {
              const key =
                d.time === "時間指定" && d.startTime && d.endTime
                  ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                  : `${d.date} (${d.time})`;

              return (
                <tr key={i}>
                  <td>{d.date}</td>
                  <td>
                    {d.startTime && d.endTime
                      ? `${d.startTime} ~ ${d.endTime}`
                      : d.time}
                  </td>
                  {users.map((u, idx) => {
                    const userResp = allResponses.find((r) => r.username === u);
                    const isSelf = u === username;
                    const value = isSelf
                      ? responses[key] || "-"
                      : userResp?.responses?.[key] || "-";

                    return (
                      <td key={idx} className="attendance-cell">
                        {isSelf ? (
                          <div className="choice-buttons">
                            {attendanceOptions.map((opt) => (
                              <button
                                key={opt}
                                className={`choice-btn ${
                                  value === opt ? "active" : ""
                                }`}
                                onClick={() => handleSelect(key, opt)}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {users.includes(username) && (
        <div className="button-area">
          <button className="save-button" onClick={handleSave}>
            保存する
          </button>
        </div>
      )}
    </div>
  );
};

export default SharePage;
