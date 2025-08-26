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
  const [users, setUsers] = useState([]);
  const [responses, setResponses] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // ===== スケジュール読み込み =====
  useEffect(() => {
    const fetchSchedule = async () => {
      const res = await fetch(`/api/schedules/${token}`);
      const data = await res.json();
      if (!data.error) {
        setSchedule(data);

        const init = {};
        data.dates.forEach((d) => {
          let label = "";
          if (d.timeType === "時間指定" && d.startTime && d.endTime) {
            label = `${d.date} (${d.startTime} ~ ${d.endTime})`;
          } else {
            label = `${d.date} (${d.timeType})`;
          }
          init[label] = "-";
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

    socket.on("deleteResponse", (data) => {
      setAllResponses((prev) =>
        prev.filter((r) => r.user_id !== data.user_id)
      );
    });

    return () => {
      socket.off("updateResponses");
      socket.off("deleteResponse");
    };
  }, [token]);

  // ===== 新規追加 =====
  const handleAddUser = () => {
    if (!username) {
      alert("名前を入力してください！✨");
      return;
    }
    if (!users.includes(username)) {
      setUsers((prev) => [...prev, username]);
    }
  };

  // ===== 編集開始 =====
  const handleEditUser = (u) => {
    setEditingUser(u);
    setIsEditing(true);

    const userResp = allResponses.find((r) => r.username === u);
    if (userResp) {
      setResponses(userResp.responses);
    }
  };

  // ===== 出欠選択 =====
  const handleSelect = (key, value) => {
    if (!isEditing) return;

    setResponses((prev) => {
      const updated = { ...prev, [key]: value };
      setAllResponses((prevAll) => {
        const existing = prevAll.find((r) => r.username === editingUser);
        if (existing) {
          return prevAll.map((r) =>
            r.username === editingUser ? { ...r, responses: updated } : r
          );
        } else {
          return [
            ...prevAll,
            { user_id: userId, username: editingUser, responses: updated },
          ];
        }
      });
      return updated;
    });
  };

  // ===== 保存 =====
  const handleSave = async () => {
    if (!editingUser) {
      alert("編集するユーザを選択してください");
      return;
    }
    try {
      const payload = { user_id: userId, username: editingUser, responses };

      const res = await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();

      setAllResponses((prev) => {
        const filtered = prev.filter((r) => r.username !== saved.username);
        return [...filtered, saved];
      });
      setResponses(saved.responses);
      setIsEditing(false);

      setSaveMessage(`✅ ${editingUser} の回答を保存しました！`);
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error("保存エラー", err);
    }
  };

  if (!schedule) return <div className="share-page">読み込み中...</div>;

  return (
    <div className="share-page">
      <h2 className="page-title">共有スケジュール</h2>

      {/* 新規追加 */}
      <div className="glass-black name-box">
        <input
          type="text"
          className="name-input"
          placeholder="新しいユーザ名を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button className="add-button" onClick={handleAddUser}>
          新規追加
        </button>
      </div>

      {/* 出欠表 */}
      <div className="glass-black schedule-list">
        <h3 className="table-title">🗓 登録された日程</h3>

        {/* ヘッダー */}
        <div className="schedule-header">
          <span className="date">日付</span>
          <span className="time">時間帯</span>
          {users.map((u, idx) => (
            <span key={idx} className="user-col">
              <a
                href="#!"
                className="user-link"
                onClick={() => handleEditUser(u)}
              >
                {u}
              </a>
            </span>
          ))}
        </div>

        {/* 日程ごとの行 */}
        {schedule.dates.map((d, i) => {
          const key =
            d.timeType === "時間指定" && d.startTime && d.endTime
              ? `${d.date} (${d.startTime} ~ ${d.endTime})`
              : `${d.date} (${d.timeType})`;

          // 時間帯ラベル変換
          let timeLabel = "";
          if (d.timeType === "all") timeLabel = "終日";
          else if (d.timeType === "day") timeLabel = "昼";
          else if (d.timeType === "night") timeLabel = "夜";
          else if (d.timeType === "時間指定" && d.startTime && d.endTime)
            timeLabel = `${d.startTime} ~ ${d.endTime}`;
          else timeLabel = d.timeType || "未設定";

          return (
            <div key={i} className="schedule-item">
              <span className="date">{d.date}</span>
              <span className="time">{timeLabel}</span>
              {users.map((u, idx) => {
                const userResp = allResponses.find((r) => r.username === u);
                const value = userResp?.responses?.[key] || "-";

                return (
                  <span key={idx} className="user-response">
                    {editingUser === u && isEditing ? (
                      attendanceOptions.map((opt) => (
                        <button
                          key={opt}
                          className={`choice-btn ${
                            value === opt ? "active" : ""
                          }`}
                          onClick={() => handleSelect(key, opt)}
                        >
                          {opt}
                        </button>
                      ))
                    ) : (
                      value
                    )}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      {editingUser && isEditing && (
        <div className="button-area">
          <button className="save-button" onClick={handleSave}>
            保存する
          </button>
        </div>
      )}

      {saveMessage && <div className="save-message">{saveMessage}</div>}
    </div>
  );
};

export default SharePage;
