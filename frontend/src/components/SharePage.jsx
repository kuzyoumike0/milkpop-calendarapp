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
  const [myResponses, setMyResponses] = useState({});
  const [saveMessage, setSaveMessage] = useState("");

  // ===== 編集モード用 =====
  const [editingCell, setEditingCell] = useState(null); // {user,dateKey}

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
          dates: data.dates || [],
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

  // ===== 保存（自分の回答） =====
  const handleSaveMyResponses = async () => {
    if (!username) {
      setSaveMessage("名前を入力してください");
      return;
    }
    const res = {
      user_id: userId,
      username,
      responses: myResponses,
    };
    await fetch(`/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(res),
    });
    setSaveMessage("保存しました！");
  };

  // ===== 編集保存（他ユーザセル） =====
  const handleSaveCell = async (user, dateKey, value) => {
    const target = allResponses.find((r) => r.username === user);
    if (!target) return;

    const updated = {
      ...target,
      responses: { ...target.responses, [dateKey]: value },
    };

    await fetch(`/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    setEditingCell(null);
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

  // 集計
  const aggregate = {};
  schedule.dates.forEach((d) => {
    const dateKey =
      d.timeType === "時間指定" && d.startTime && d.endTime
        ? `${d.date} (${d.startTime} ~ ${d.endTime})`
        : `${d.date} (${d.timeType})`;
    aggregate[dateKey] = { "○": 0, "✖": 0, "△": 0 };
  });
  allResponses.forEach((row) => {
    Object.entries(row.responses).forEach(([key, status]) => {
      if (aggregate[key] && ["○", "✖", "△"].includes(status)) {
        aggregate[key][status]++;
      }
    });
  });

  return (
    <div className="share-container">
      <h1 className="share-title">MilkPOP Calendar</h1>

      {/* 自分の回答 */}
      <div className="my-response-box">
        <h2>自分の回答</h2>
        <input
          type="text"
          className="username-input"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="my-responses-list">
          {schedule.dates.map((d) => {
            const dateKey =
              d.timeType === "時間指定" && d.startTime && d.endTime
                ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                : `${d.date} (${d.timeType})`;
            return (
              <div key={dateKey} className="my-response-item">
                <span className="date-label">{formatDate(d)}</span>
                <select
                  className="attendance-select"
                  value={myResponses[dateKey] || "-"}
                  onChange={(e) =>
                    setMyResponses((prev) => ({
                      ...prev,
                      [dateKey]: e.target.value,
                    }))
                  }
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
        </div>

        <button className="save-btn" onClick={handleSaveMyResponses}>
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
              <th>日付</th>
              <th>回答数</th>
              <th>ユーザ名</th>
            </tr>
          </thead>
          <tbody>
            {schedule.dates.map((d) => {
              const dateKey =
                d.timeType === "時間指定" && d.startTime && d.endTime
                  ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                  : `${d.date} (${d.timeType})`;
              return (
                <tr key={dateKey}>
                  <td>{formatDate(d)}</td>
                  <td>
                    ○{aggregate[dateKey]?.["○"] || 0}　
                    ✖{aggregate[dateKey]?.["✖"] || 0}　
                    △{aggregate[dateKey]?.["△"] || 0}
                  </td>
                  <td>
                    {uniqueUsers.map((user) => {
                      const userResponse = allResponses.find(
                        (r) => r.username === user
                      );
                      const currentVal =
                        userResponse?.responses?.[dateKey] || "-";
                      const isEditing =
                        editingCell &&
                        editingCell.user === user &&
                        editingCell.dateKey === dateKey;

                      return (
                        <div
                          key={`${user}-${dateKey}`}
                          className="user-response"
                        >
                          {isEditing ? (
                            <select
                              className="attendance-select"
                              value={currentVal}
                              onChange={(e) =>
                                handleSaveCell(user, dateKey, e.target.value)
                              }
                            >
                              {attendanceOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className="editable-username"
                              onClick={() =>
                                setEditingCell({ user, dateKey })
                              }
                            >
                              {user}: {currentVal}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </td>
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
