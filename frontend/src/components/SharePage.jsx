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
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingResponses, setEditingResponses] = useState({});
  const [editingUsername, setEditingUsername] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // ===== スケジュール読み込み =====
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

  // ===== 日付フォーマット =====
  const formatDate = (d) => {
    const date = new Date(d.date);
    const base = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    if (d.timeType === "時間指定" && d.startTime && d.endTime) {
      return `${base} (${d.startTime} ~ ${d.endTime})`;
    }
    return `${base}（${d.timeType || "未定"}）`;
  };

  // ===== 編集開始 =====
  const handleEditUser = (user) => {
    setEditingUserId(user.user_id);
    setEditingUsername(user.username);
    setEditingResponses(user.responses || {});
  };

  // ===== 新規回答開始 =====
  const handleNewResponse = () => {
    setEditingUserId("new");
    setEditingUsername("");
    const init = {};
    schedule.dates.forEach((d) => {
      const key =
        d.timeType === "時間指定" && d.startTime && d.endTime
          ? `${d.date} (${d.startTime} ~ ${d.endTime})`
          : `${d.date} (${d.timeType})`;
      init[key] = "-";
    });
    setEditingResponses(init);
  };

  // ===== 編集中のセル更新 =====
  const handleEditChange = (dateKey, value) => {
    setEditingResponses((prev) => ({
      ...prev,
      [dateKey]: value,
    }));
  };

  // ===== 保存 =====
  const handleSaveEdit = async () => {
    if (!editingUserId || !editingUsername.trim()) return;

    try {
      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: editingUserId === "new" ? crypto.randomUUID() : editingUserId,
          username: editingUsername.trim(),
          responses: editingResponses,
        }),
      });

      setSaveMessage("保存しました！");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch (err) {
      console.error("保存エラー:", err);
      setSaveMessage("保存に失敗しました");
    }

    setEditingUserId(null);
    setEditingResponses({});
    setEditingUsername("");
  };

  if (!schedule) return <div>読み込み中...</div>;

  return (
    <div className="share-container">
      <h1 className="share-title">MilkPOP Calendar</h1>

      {/* みんなの回答 */}
      <div className="all-responses">
        <h2>みんなの回答</h2>
        <table className="responses-table">
          <thead>
            <tr>
              <th>ユーザ名</th>
              {schedule?.dates?.map((d) => (
                <th key={d.date}>{formatDate(d)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allResponses.map((user) => (
              <tr key={user.user_id}>
                <td
                  className="editable-username"
                  onClick={() => handleEditUser(user)}
                >
                  {user.username}
                </td>
                {schedule.dates.map((d) => {
                  const dateKey =
                    d.timeType === "時間指定" && d.startTime && d.endTime
                      ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                      : `${d.date} (${d.timeType})`;
                  return (
                    <td key={dateKey}>
                      {user.responses?.[dateKey] || "-"}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* 編集中 or 新規回答行 */}
            {editingUserId && (
              <tr>
                <td>
                  <input
                    type="text"
                    value={editingUsername}
                    placeholder="ユーザ名"
                    onChange={(e) => setEditingUsername(e.target.value)}
                  />
                </td>
                {schedule.dates.map((d) => {
                  const dateKey =
                    d.timeType === "時間指定" && d.startTime && d.endTime
                      ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                      : `${d.date} (${d.timeType})`;
                  return (
                    <td key={dateKey}>
                      <select
                        className="attendance-select"
                        value={editingResponses[dateKey] || "-"}
                        onChange={(e) =>
                          handleEditChange(dateKey, e.target.value)
                        }
                      >
                        {attendanceOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>

        {/* 操作ボタン */}
        <div className="edit-actions">
          {!editingUserId && (
            <button className="save-btn" onClick={handleNewResponse}>
              新規回答を追加
            </button>
          )}
          {editingUserId && (
            <button className="save-btn" onClick={handleSaveEdit}>
              保存
            </button>
          )}
        </div>

        {saveMessage && <p className="save-message">{saveMessage}</p>}
      </div>
    </div>
  );
};

export default SharePage;
