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

  // ===== 編集用（みんなの回答） =====
  const [editedResponses, setEditedResponses] = useState({}); // { username: {dateKey: value} }

  // ===== スケジュール読み込み =====
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        if (!res.ok) throw new Error("schedule fetch failed");
        const data = await res.json();
        setSchedule(data);

        const res2 = await fetch(`/api/schedules/${token}/responses`);
        if (!res2.ok) throw new Error("responses fetch failed");
        const data2 = await res2.json();
        setAllResponses(data2);
      } catch (err) {
        console.error("読み込みエラー:", err);
      }
    };
    if (token) fetchSchedule();

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

  // ===== 自分の入力変更 =====
  const handleChange = (dateKey, value) => {
    setResponses((prev) => ({
      ...prev,
      [dateKey]: value,
    }));
  };

  // ===== 自分の保存 =====
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
      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(res),
      });
      setSaveMessage("保存しました！");
    } catch (err) {
      console.error("保存エラー:", err);
      setSaveMessage("保存に失敗しました");
    }
  };

  // ===== 他ユーザーの編集保存 =====
  const handleOtherChange = (user, dateKey, value) => {
    setEditedResponses((prev) => ({
      ...prev,
      [user]: { ...prev[user], [dateKey]: value },
    }));
  };

  const handleOtherSave = async (user) => {
    const userResponse = allResponses.find((r) => r.username === user);
    if (!userResponse) return;

    const newRes = {
      user_id: userResponse.user_id,
      username: userResponse.username,
      responses: { ...userResponse.responses, ...editedResponses[user] },
    };

    try {
      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRes),
      });

      setEditedResponses((prev) => {
        const copy = { ...prev };
        delete copy[user];
        return copy;
      });
    } catch (err) {
      console.error("他ユーザー保存エラー:", err);
    }
  };

  // ===== 日付フォーマット =====
  const formatDate = (dateStr, timeType, start, end) => {
    const d = new Date(dateStr);
    const base = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    if (timeType === "時間指定" && start && end) {
      return `${base} (${start} ~ ${end})`;
    }
    return `${base}（${timeType || "未定"}）`;
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
        {schedule?.dates?.map((d) => {
          const dateKey =
            d.timeType === "時間指定" && d.startTime && d.endTime
              ? `${d.date} (${d.startTime} ~ ${d.endTime})`
              : `${d.date} (${d.timeType})`;
          return (
            <div key={dateKey} className="date-response">
              <span className="date-label">
                {formatDate(d.date, d.timeType, d.startTime, d.endTime)}
              </span>
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
                <th key={user}>{user}</th>
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
                  <td>{formatDate(d.date, d.timeType, d.startTime, d.endTime)}</td>
                  {uniqueUsers.map((user) => {
                    const userResponse = allResponses.find(
                      (r) => r.username === user
                    );
                    const currentValue =
                      editedResponses[user]?.[dateKey] ??
                      userResponse?.responses?.[dateKey] ??
                      "-";
                    return (
                      <td key={user}>
                        <select
                          value={currentValue}
                          onChange={(e) =>
                            handleOtherChange(user, dateKey, e.target.value)
                          }
                        >
                          {attendanceOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {editedResponses[user] && (
                          <button
                            className="save-btn small"
                            onClick={() => handleOtherSave(user)}
                          >
                            保存
                          </button>
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
    </div>
  );
};

export default SharePage;
