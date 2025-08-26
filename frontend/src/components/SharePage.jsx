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

  // 編集用
  const [editingUser, setEditingUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");

  // ===== 日付を表示形式に変換 =====
  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d.date);
    const base = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    if (d.timeType === "時間指定" && d.startTime && d.endTime) {
      return `${base} (${d.startTime} ~ ${d.endTime})`;
    }
    return `${base} (${d.timeType})`;
  };

  // ===== Key を統一して管理 =====
  const makeKey = (d) => {
    if (d.timeType === "時間指定" && d.startTime && d.endTime) {
      return `${d.date} (${d.startTime} ~ ${d.endTime})`;
    }
    return `${d.date} (${d.timeType})`;
  };

  // ===== スケジュール読み込み =====
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        if (!res.ok) throw new Error("スケジュール取得失敗");
        const data = await res.json();
        setSchedule(data);

        const res2 = await fetch(`/api/schedules/${token}/responses`);
        if (!res2.ok) throw new Error("回答一覧取得失敗");
        setAllResponses(await res2.json());
      } catch (err) {
        console.error("読み込みエラー:", err);
      }
    };
    fetchSchedule();

    socket.emit("joinSchedule", token);
    socket.on("updateResponses", (data) => {
      setAllResponses((prev) => {
        const others = prev.filter((r) => r.user_id !== data.user_id);
        return [...others, data];
      });
    });

    return () => {
      socket.off("updateResponses");
    };
  }, [token]);

  // ===== プルダウン変更 =====
  const handleChange = (d, value) => {
    const key = makeKey(d);
    setResponses((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ===== 保存 =====
  const handleSave = async () => {
    if (!username) {
      setSaveMessage("名前を入力してください");
      return;
    }
    const res = {
      user_id: userId,
      username,
      responses,
    };
    try {
      const response = await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(res),
      });
      if (!response.ok) throw new Error("保存失敗");
      setSaveMessage("保存しました！");
    } catch (err) {
      console.error("保存エラー:", err);
      setSaveMessage("保存に失敗しました");
    }
  };

  const handleUsernameEdit = (user) => {
    setEditingUser(user);
    setNewUsername(user);
  };

  const handleUsernameSave = async (oldName) => {
    if (!newUsername.trim()) return;
    await fetch(`/api/schedules/${token}/edit-username`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldName,
        newName: newUsername.trim(),
      }),
    });
    setEditingUser(null);
    setNewUsername("");
  };

  if (!schedule) return <div>読み込み中...</div>;

  // 全ユーザーリスト
  const uniqueUsers = [...new Set(allResponses.map((r) => r.username))];

  return (
    <div className="share-container">
      <h1 className="share-title">MilkPOP Calendar</h1>

      {/* 入力フォーム */}
      <div className="response-form">
        <input
          type="text"
          className="username-input"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {schedule.dates.map((d, idx) => {
          const key = makeKey(d);
          return (
            <div key={idx} className="date-response">
              <span className="date-label">{formatDate(d)}</span>
              <select
                className="attendance-select"
                value={responses[key] || "-"}
                onChange={(e) => handleChange(d, e.target.value)}
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
        <button className="save-btn" onClick={handleSave}>
          保存する
        </button>
        {saveMessage && <p className="save-message">{saveMessage}</p>}
      </div>

      {/* みんなの回答 */}
      <div className="all-responses">
        <h2>みんなの回答</h2>
        <table className="responses-table">
          <thead>
            <tr>
              <th>日程</th>
              {uniqueUsers.map((user) => (
                <th key={user}>
                  {editingUser === user ? (
                    <input
                      type="text"
                      className="username-edit-input"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      onBlur={() => handleUsernameSave(user)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUsernameSave(user);
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="editable-username"
                      onClick={() => handleUsernameEdit(user)}
                    >
                      {user}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.dates.map((d, idx) => {
              const key = makeKey(d);
              return (
                <tr key={idx}>
                  <td>{formatDate(d)}</td>
                  {uniqueUsers.map((user) => {
                    const userResponse = allResponses.find(
                      (r) => r.username === user
                    );
                    return (
                      <td key={user}>
                        {userResponse?.responses?.[key] || "-"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SharePage;
