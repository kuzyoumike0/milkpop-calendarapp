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

  // 編集中ユーザ
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingResponses, setEditingResponses] = useState({});

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      const res1 = await fetch(`/api/schedules/${token}`);
      if (!res1.ok) return;
      const data1 = await res1.json();
      setSchedule({ ...data1, dates: data1.dates || [] });

      const res2 = await fetch(`/api/schedules/${token}/responses`);
      if (!res2.ok) return;
      const data2 = await res2.json();
      setAllResponses(data2);
    };
    fetchData();

    socket.emit("joinSchedule", token);
    socket.on("updateResponses", (newRes) => {
      setAllResponses((prev) => {
        const others = prev.filter((r) => r.user_id !== newRes.user_id);
        return [...others, newRes];
      });
    });

    return () => {
      socket.off("updateResponses");
    };
  }, [token]);

  // 編集開始
  const handleEditUser = (user) => {
    setEditingUserId(user.user_id);
    setEditingResponses(user.responses || {});
  };

  // 値変更
  const handleChange = (dateKey, value) => {
    setEditingResponses((prev) => ({
      ...prev,
      [dateKey]: value,
    }));
  };

  // 保存
  const handleSave = async () => {
    const user = allResponses.find((r) => r.user_id === editingUserId);
    if (!user) return;

    const response = await fetch(`/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.user_id,
        username: user.username,
        responses: editingResponses,
      }),
    });
    const data = await response.json();

    setAllResponses((prev) => {
      const others = prev.filter((r) => r.user_id !== data.user_id);
      return [...others, data];
    });

    setEditingUserId(null);
    setEditingResponses({});
  };

  // 日付表示
  const formatDate = (d) => {
    const date = new Date(d.date);
    const base = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    if (d.timeType === "時間指定" && d.startTime && d.endTime) {
      return `${base} (${d.startTime} ~ ${d.endTime})`;
    }
    return `${base}（${d.timeType || "未定"}）`;
  };

  if (!schedule) return <div>読み込み中...</div>;

  const uniqueUsers = allResponses;

  return (
    <div className="share-container">
      <h1 className="share-title">MilkPOP Calendar</h1>

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
            {uniqueUsers.map((user) => {
              const isEditing = editingUserId === user.user_id;
              return (
                <tr key={user.user_id}>
                  <td
                    className="editable-username"
                    onClick={() => !isEditing && handleEditUser(user)}
                  >
                    {user.username}
                  </td>
                  {schedule?.dates?.map((d) => {
                    const dateKey =
                      d.timeType === "時間指定" && d.startTime && d.endTime
                        ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                        : `${d.date} (${d.timeType})`;

                    const currentValue = isEditing
                      ? editingResponses[dateKey] || "-"
                      : user.responses?.[dateKey] || "-";

                    return (
                      <td key={dateKey}>
                        {isEditing ? (
                          <select
                            className="attendance-select"
                            value={currentValue}
                            onChange={(e) => handleChange(dateKey, e.target.value)}
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

        {editingUserId && (
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSave}>
              保存
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePage;
