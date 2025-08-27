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
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState("-");
  const [saveMessage, setSaveMessage] = useState("");

  // 自分用
  const [username, setUsername] = useState("");
  const [userId] = useState(() => crypto.randomUUID());
  const [myResponses, setMyResponses] = useState({});

  useEffect(() => {
    if (!token) return;

    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        const data = await res.json();
        setSchedule({ ...data, dates: data.dates || [] });

        const res2 = await fetch(`/api/schedules/${token}/responses`);
        const data2 = await res2.json();
        setAllResponses(data2);

        // 自分の回答があれば復元
        const mine = data2.find((r) => r.user_id === userId);
        if (mine) {
          setUsername(mine.username);
          setMyResponses(mine.responses || {});
        }
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
  }, [token, userId]);

  // 日付フォーマット
  const formatDate = (d) => {
    const date = new Date(d.date);
    const base = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    if (d.timeType === "時間指定" && d.startTime && d.endTime) {
      return `${base} (${d.startTime} ~ ${d.endTime})`;
    }
    return `${base}（${d.timeType || "未定"}）`;
  };

  // 自分の回答保存
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
    setTimeout(() => setSaveMessage(""), 2000);
  };

  // 編集モードの保存
  const handleSaveEdit = async () => {
    if (!editingCell) return;
    const user = allResponses.find((u) => u.user_id === editingCell.user_id);
    if (!user) return;

    const newResponses = {
      ...user.responses,
      [editingCell.dateKey]: editingValue,
    };

    await fetch(`/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.user_id,
        username: user.username,
        responses: newResponses,
      }),
    });

    setAllResponses((prev) =>
      prev.map((u) =>
        u.user_id === user.user_id ? { ...u, responses: newResponses } : u
      )
    );

    setEditingCell(null);
    setEditingValue("-");
    setSaveMessage("保存しました！");
    setTimeout(() => setSaveMessage(""), 2000);
  };

  if (!schedule) return <div>読み込み中...</div>;

  return (
    <div className="share-container">
      <h1 className="share-title">MilkPOP Calendar</h1>

      {/* 自分の回答エリア */}
      <div className="my-response-box">
        <h2>自分の回答</h2>
        <input
          type="text"
          className="username-input"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {schedule.dates.map((d) => {
          const dateKey =
            d.timeType === "時間指定" && d.startTime && d.endTime
              ? `${d.date} (${d.startTime} ~ ${d.endTime})`
              : `${d.date} (${d.timeType})`;
          return (
            <div key={dateKey} className="date-response">
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
            {schedule?.dates?.map((d) => {
              const dateKey =
                d.timeType === "時間指定" && d.startTime && d.endTime
                  ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                  : `${d.date} (${d.timeType})`;

              // 回答集計
              const responsesForDate = allResponses.map((user) => ({
                user_id: user.user_id,
                username: user.username,
                response: user.responses?.[dateKey] || "-",
              }));

              const counts = { "○": 0, "✖": 0, "△": 0, "-": 0 };
              responsesForDate.forEach((r) => counts[r.response]++);

              return (
                <tr key={dateKey}>
                  <td>{formatDate(d)}</td>
                  <td>
                    <span className="count-badge ok">○ {counts["○"]}</span>
                    <span className="count-badge no">✖ {counts["✖"]}</span>
                    <span className="count-badge maybe">△ {counts["△"]}</span>
                    <span className="count-badge none">- {counts["-"]}</span>
                  </td>
                  <td>
                    {responsesForDate.map((r) => (
                      <span
                        key={r.user_id}
                        className="response-tag"
                        onClick={() =>
                          setEditingCell({
                            user_id: r.user_id,
                            username: r.username,
                            dateKey,
                            currentValue: r.response,
                          })
                        }
                      >
                        {editingCell &&
                        editingCell.user_id === r.user_id &&
                        editingCell.dateKey === dateKey ? (
                          <select
                            className="attendance-select"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                          >
                            {attendanceOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          `${r.username} (${r.response})`
                        )}
                      </span>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {editingCell && (
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSaveEdit}>
              編集を保存
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePage;
