import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import "../common.css";
import "../share.css";

const attendanceOptions = [
  { value: "○", label: "○ 出席" },
  { value: "✖", label: "✖ 欠席" },
  { value: "△", label: "△ 未定" },
  { value: "-", label: "- 未回答" },
];
const socket = io();

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [allResponses, setAllResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [userId] = useState(() => crypto.randomUUID());
  const [responses, setResponses] = useState({});
  const [saveMessage, setSaveMessage] = useState("");

  // 編集モード管理
  const [editingUser, setEditingUser] = useState(null);
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

  // 編集開始
  const handleUserEdit = (user) => {
    setEditingUser(user);
    const target = allResponses.find((r) => r.username === user);
    setEditedResponses({ ...(target?.responses || {}) });
  };

  // 編集保存
  const handleEditSave = async () => {
    const target = allResponses.find((r) => r.username === editingUser);
    if (!target) return;

    await fetch(`/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: target.user_id,
        username: editingUser,
        responses: editedResponses,
      }),
    });

    setEditingUser(null);
    setEditedResponses({});
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

  const uniqueUsers = [...new Set(allResponses.map((r) => r.username))];

  return (
    <div className="share-container">
      <h1 className="share-title">MilkPOP Calendar</h1>

      {/* 自分の回答 */}
      <div className="my-responses">
        <h2>自分の回答</h2>
        <input
          type="text"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="username-input"
        />
        <div className="my-responses-list">
          {schedule?.dates?.map((d) => {
            const dateKey =
              d.timeType === "時間指定" && d.startTime && d.endTime
                ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                : `${d.date} (${d.timeType})`;
            return (
              <div key={dateKey} className="my-response-item">
                <span className="date-label">{formatDate(d)}</span>
                <select
                  className="fancy-select"
                  value={responses[dateKey] || "-"}
                  onChange={(e) => handleChange(dateKey, e.target.value)}
                >
                  {attendanceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
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

      {/* みんなの回答 */}
      <div className="all-responses">
        <h2>みんなの回答</h2>
        <div className="filter-box">
          <label>フィルタ: </label>
          <select className="fancy-select">
            <option value="all">すべて表示</option>
            <option value="ok">○がある日程</option>
            <option value="ng">✖がある日程</option>
            <option value="maybe">△がある日程</option>
          </select>
        </div>
        <table className="responses-table">
          <thead>
            <tr>
              <th>日付</th>
              <th>回答数</th>
              {uniqueUsers.map((user) => (
                <th key={user}>
                  {editingUser === user ? (
                    <div>
                      <button className="username-save-btn" onClick={handleEditSave}>
                        保存
                      </button>
                    </div>
                  ) : (
                    <span
                      className="editable-username"
                      onClick={() => handleUserEdit(user)}
                    >
                      {user}
                    </span>
                  )}
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

              const counts = { "○": 0, "✖": 0, "△": 0 };
              allResponses.forEach((r) => {
                const ans = r.responses?.[dateKey];
                if (ans && counts[ans] !== undefined) counts[ans]++;
              });

              return (
                <tr key={dateKey}>
                  <td className="date-label">{formatDate(d)}</td>
                  <td>
                    <span className="count-ok">○{counts["○"]}</span>{" "}
                    <span className="count-ng">✖{counts["✖"]}</span>{" "}
                    <span className="count-maybe">△{counts["△"]}</span>
                  </td>
                  {uniqueUsers.map((user) => {
                    const userResponse = allResponses.find((r) => r.username === user);
                    const value = userResponse?.responses?.[dateKey] || "-";

                    return (
                      <td key={user}>
                        {editingUser === user ? (
                          <select
                            className="fancy-select"
                            value={editedResponses[dateKey] || value}
                            onChange={(e) =>
                              setEditedResponses((prev) => ({
                                ...prev,
                                [dateKey]: e.target.value,
                              }))
                            }
                          >
                            {attendanceOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
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
    </div>
  );
};

export default SharePage;
