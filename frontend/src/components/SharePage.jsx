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
  // { user_id, username, dateKey, currentValue }
  const [editingValue, setEditingValue] = useState("-");
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

  // ===== 保存 =====
  const handleSaveEdit = async () => {
    if (!editingCell) return;

    const user = allResponses.find((u) => u.user_id === editingCell.user_id);
    if (!user) return;

    const newResponses = {
      ...user.responses,
      [editingCell.dateKey]: editingValue,
    };

    try {
      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          username: user.username,
          responses: newResponses,
        }),
      });

      // 即時反映
      setAllResponses((prev) =>
        prev.map((u) =>
          u.user_id === user.user_id ? { ...u, responses: newResponses } : u
        )
      );

      setSaveMessage("保存しました！");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch (err) {
      console.error("保存エラー:", err);
      setSaveMessage("保存に失敗しました");
    }

    setEditingCell(null);
    setEditingValue("-");
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

              // 全ユーザの回答
              const responsesForDate = allResponses.map((user) => ({
                user_id: user.user_id,
                username: user.username,
                response: user.responses?.[dateKey] || "-",
              }));

              // 集計
              const counts = { "○": 0, "✖": 0, "△": 0, "-": 0 };
              responsesForDate.forEach((r) => counts[r.response]++);

              return (
                <tr key={dateKey}>
                  <td>{formatDate(d)}</td>
                  <td>
                    ○{counts["○"]} ✖{counts["✖"]} △{counts["△"]} -{counts["-"]}
                  </td>
                  <td>
                    {responsesForDate.map((r) => (
                      <span
                        key={r.user_id}
                        className={`response-tag response-${r.response}`}
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

        {/* 保存ボタン */}
        {editingCell && (
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
