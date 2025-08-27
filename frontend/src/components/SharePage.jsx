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
    setEditingResponses(user.responses || {});
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
    if (!editingUserId) return;
    const targetUser = allResponses.find((u) => u.user_id === editingUserId);
    if (!targetUser) return;

    try {
      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: editingUserId,
          username: targetUser.username,
          responses: editingResponses,
        }),
      });

      // 即時反映
      setAllResponses((prev) =>
        prev.map((u) =>
          u.user_id === editingUserId ? { ...u, responses: editingResponses } : u
        )
      );

      setSaveMessage("保存しました！");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch (err) {
      console.error("保存エラー:", err);
      setSaveMessage("保存に失敗しました");
    }

    setEditingUserId(null);
    setEditingResponses({});
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
              <th>日程</th>
              {allResponses.map((user) => (
                <th
                  key={user.user_id}
                  className="editable-username"
                  onClick={() => handleEditUser(user)}
                >
                  {user.username}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule?.dates?.map((d) => {
              const dateKey =
                d.timeType === "時間指定" && d.startTime && d.endTime
                  ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                  : `${d.date} (${d.timeType})`;
              return (
                <tr key={dateKey}>
                  <td>{formatDate(d)}</td>
                  {allResponses.map((user) => {
                    const isEditing = editingUserId === user.user_id;
                    const currentValue = isEditing
                      ? editingResponses[dateKey] || "-"
                      : user.responses?.[dateKey] || "-";

                    return (
                      <td key={user.user_id}>
                        {isEditing ? (
                          <select
                            className="attendance-select"
                            value={currentValue}
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
                        ) : (
                          currentValue
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 保存ボタン */}
        {editingUserId && (
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSaveEdit}>
              保存
            </button>
          </div>
        )}

        {saveMessage && <p className="save-message">{saveMessage}</p>}
      </div>
    </div>
  );
};

export default SharePage;
