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

  // ===== ユーザ名編集用 =====
  const [editingUser, setEditingUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");

  // ===== スケジュール読み込み =====
  useEffect(() => {
    if (!token) return;

    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        if (!res.ok) throw new Error("スケジュール取得失敗");
        const data = await res.json();
        setSchedule({
          ...data,
          dates: data.dates || [], // datesが無ければ空配列を補完
        });

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

  // ===== 入力変更 =====
  const handleChange = (dateKey, value) => {
    setResponses((prev) => ({
      ...prev,
      [dateKey]: value,
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
    await fetch(`/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(res),
    });
    setSaveMessage("保存しました！");
  };

  // ===== ユーザ名編集 =====
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

  // ===== 日付フォーマット =====
  const formatDate = (d) => {
    const date = new Date(d.date);
    const base = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    if (d.timeType === "時間指定" && d.startTime && d.endTime) {
      return `${base} (${d.startTime} ~ ${d.endTime})`;
    }
    return `${base}（${d.timeType || "未定"}）`;
  };

  if (!schedule) return <div>読み込み中...</div>;

  // ユニークユーザー
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
        {schedule?.dates?.map((d) => {  // ← 安全にmap
          const dateKey =
            d.timeType === "時間指定" && d.startTime && d.endTime
              ? `${d.date} (${d.startTime} ~ ${d.endTime})`
              : `${d.date} (${d.timeType})`;
          return (
            <div key={dateKey} className="date-response">
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
                    <div className="username-edit-box">
                      <input
                        type="text"
                        className="username-edit-input"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                      />
                      <button
                        className="username-save-btn"
                        onClick={() => handleUsernameSave(user)}
                      >
                        保存
                      </button>
                    </div>
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
            {schedule?.dates?.map((d) => {   // ← 安全にmap
              const dateKey =
                d.timeType === "時間指定" && d.startTime && d.endTime
                  ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                  : `${d.date} (${d.timeType})`;
              return (
                <tr key={dateKey}>
                  <td>{formatDate(d)}</td>
                  {uniqueUsers.map((user) => {
                    const userResponse = allResponses.find(
                      (r) => r.username === user
                    );
                    return (
                      <td key={user}>
                        {userResponse?.responses?.[dateKey] || "-"}
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
