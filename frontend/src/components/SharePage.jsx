// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "../share.css";

const socket = io();

export default function SharePage() {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [myResponses, setMyResponses] = useState({});
  const [filter, setFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null); // 👈 編集中ユーザ
  const [editedResponses, setEditedResponses] = useState({});
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    fetch(`/api/schedules/${token}`)
      .then((res) => res.json())
      .then((data) => setSchedule(data));

    fetch(`/api/schedules/${token}/responses`)
      .then((res) => res.json())
      .then((data) => setResponses(data));

    socket.emit("joinSchedule", token);

    socket.on("scheduleUpdated", () => {
      fetch(`/api/schedules/${token}/responses`)
        .then((res) => res.json())
        .then((data) => setResponses(data));
    });

    return () => socket.off("scheduleUpdated");
  }, [token]);

  if (!schedule) return <div>読み込み中...</div>;

  // 日付フォーマット
  const formatDate = (d) => {
    if (d.timeType === "時間指定") {
      const start = d.startTime || "09:00";
      const end = d.endTime || "18:00";
      return `${d.date} （${start} ~ ${end}）`;
    } else {
      return `${d.date} （${d.timeType}）`;
    }
  };

  // 自分の回答保存
  const handleSave = async () => {
    try {
      const res = await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, responses: myResponses }),
      });
      const updated = await res.json();
      setResponses(updated);
      socket.emit("updateSchedule", token);
      setSaveMessage("保存しました！");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch {
      alert("保存に失敗しました");
    }
  };

  // 編集保存
  const handleEditSave = async () => {
    try {
      const res = await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editingUser,
          responses: editedResponses,
        }),
      });
      const updated = await res.json();
      setResponses(updated);
      socket.emit("updateSchedule", token);
      setEditingUser(null);
    } catch {
      alert("保存に失敗しました");
    }
  };

  // 集計
  const summary = schedule.dates.map((d) => {
    const counts = { "◯": 0, "✕": 0, "△": 0 };
    responses.forEach((r) => {
      const val = r.responses[d.date];
      if (val && counts[val] !== undefined) counts[val]++;
    });
    return { ...d, counts };
  });

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
          {schedule.dates.map((d, idx) => (
            <div key={idx} className="my-response-item">
              <span className="date-label">{formatDate(d)}</span>
              <select
                className="fancy-select"
                value={myResponses[d.date] || "-"}
                onChange={(e) =>
                  setMyResponses({ ...myResponses, [d.date]: e.target.value })
                }
              >
                <option value="-">- 未回答</option>
                <option value="◯">◯ 参加</option>
                <option value="✕">✕ 不参加</option>
                <option value="△">△ 未定</option>
              </select>
            </div>
          ))}
        </div>
        <button className="save-btn" onClick={handleSave}>
          保存する
        </button>
        {saveMessage && <div className="save-message">{saveMessage}</div>}
      </div>

      {/* みんなの回答 */}
      <div className="all-responses">
        <h2>みんなの回答</h2>
        <div style={{ marginBottom: "20px" }}>
          フィルタ：
          <select
            className="fancy-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">すべて表示</option>
            <option value="ok">◯ 多い順</option>
            <option value="ng">✕ 多い順</option>
            <option value="maybe">△ 多い順</option>
          </select>
        </div>

        <table className="responses-table">
          <thead>
            <tr>
              <th>日付</th>
              <th>回答数</th>
              {responses.map((r, idx) => (
                <th key={idx}>
                  <span
                    className="editable-username"
                    onClick={() => {
                      setEditingUser(r.username);
                      setEditedResponses(r.responses);
                    }}
                  >
                    {r.username}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summary.map((d, idx) => (
              <tr key={idx}>
                <td>{formatDate(d)}</td>
                <td>
                  <span className="count-ok">◯{d.counts["◯"]}</span>{" "}
                  <span className="count-ng">✕{d.counts["✕"]}</span>{" "}
                  <span className="count-maybe">△{d.counts["△"]}</span>
                </td>
                {responses.map((r, uIdx) => (
                  <td key={uIdx}>
                    {editingUser === r.username ? (
                      <select
                        className="fancy-select"
                        value={editedResponses[d.date] || "-"}
                        onChange={(e) =>
                          setEditedResponses({
                            ...editedResponses,
                            [d.date]: e.target.value,
                          })
                        }
                      >
                        <option value="-">- 未回答</option>
                        <option value="◯">◯ 参加</option>
                        <option value="✕">✕ 不参加</option>
                        <option value="△">△ 未定</option>
                      </select>
                    ) : (
                      r.responses[d.date] || "-"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {editingUser && (
          <div className="edit-save-bar">
            <button className="username-save-btn" onClick={handleEditSave}>
              編集を保存
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
