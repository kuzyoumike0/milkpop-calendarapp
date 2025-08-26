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
      setIsEditing(true);
    }
  };

  // ===== 出欠クリック =====
  const handleSelect = (key, value) => {
    if (!isEditing) return;

    setResponses((prev) => {
      const updated = { ...prev, [key]: value };
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

  // ===== 保存 =====
  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください！（必須）");
      return;
    }
    try {
      const payload = { user_id: userId, username, responses };

      const res = await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();

      setAllResponses((prev) => {
        const filtered = prev.filter((r) => r.user_id !== saved.user_id);
        return [...filtered, saved];
      });
      setResponses(saved.responses);
      setIsEditing(false);

      setSaveMessage("✅ 保存しました！");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error("保存エラー", err);
    }
  };

  if (!schedule) return <div className="share-page">読み込み中...</div>;

  return (
    <div className="share-page">
      <h2 className="page-title">共有スケジュール</h2>

      {/* タイトル + 保存メッセージ */}
      <div className="glass-black title-box">
        {schedule.title}
        {saveMessage && <span className="save-message">{saveMessage}</span>}
      </div>

      {/* 名前入力 */}
      <div className="glass-black name-box">
        <input
          type="text"
          className="name-input"
          placeholder="あなたの名前を入力（必須）"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* 新規追加ボタン */}
      <div className="button-area">
        <button className="add-button" onClick={handleAddUser}>
          新規追加
        </button>
      </div>

      {/* 出欠表 横並び */}
      <div className="glass-black schedule-list">
        {schedule.dates.map((d, i) => {
          const key =
            d.timeType === "時間指定" && d.startTime && d.endTime
              ? `${d.date} (${d.startTime} ~ ${d.endTime})`
              : `${d.date} (${d.timeType})`;

          return (
            <div key={i} className="schedule-item">
              <span className="date">{d.date}</span>
              <span className="time">
                {d.timeType === "時間指定" && d.startTime && d.endTime
                  ? `${d.startTime} ~ ${d.endTime}`
                  : d.timeType}
              </span>
              {users.map((u, idx) => {
                const userResp = allResponses.find((r) => r.username === u);
                const isSelf = u === username;
                const value = isSelf
                  ? responses[key] || "-"
                  : userResp?.responses?.[key] || "-";

                return (
                  <span key={idx} className="user-response">
                    {isSelf && isEditing ? (
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

      {users.includes(username) && isEditing && (
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
