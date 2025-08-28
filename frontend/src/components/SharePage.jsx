// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import "../share.css";

const socket = io();

export default function SharePage() {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [myResponses, setMyResponses] = useState({});
  const [filter, setFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [editedResponses, setEditedResponses] = useState({});
  const [saveMessage, setSaveMessage] = useState("");

  // ランダムな user_id を生成（固定化）
  const [userId] = useState(() => uuidv4());

  useEffect(() => {
    fetch(`/api/schedules/${token}`)
      .then((res) => res.json())
      .then((data) => setSchedule(data));

    fetch(`/api/schedules/${token}/responses`)
      .then((res) => res.json())
      .then((data) => setResponses(data));

    socket.emit("joinSchedule", token);

    socket.on("updateResponses", () => {
      fetch(`/api/schedules/${token}/responses`)
        .then((res) => res.json())
        .then((data) => setResponses(data));
    });

    return () => socket.off("updateResponses");
  }, [token]);

  if (!schedule) return <div>読み込み中...</div>;

  // 表示用ラベル
  const getTimeLabel = (d) => {
    if (d.timeType === "custom") {
      return `${d.startTime} ~ ${d.endTime}`;
    }
    if (d.timeType === "allday") return "終日";
    if (d.timeType === "day") return "午前";
    if (d.timeType === "night") return "午後";
    return d.timeType;
  };

  // 表示用キー
  const getKey = (date, d) => {
    if (d.timeType === "custom") {
      return `${date} (${d.startTime} ~ ${d.endTime})`;
    }
    if (d.timeType === "allday") return `${date} (終日)`;
    if (d.timeType === "day") return `${date} (午前)`;
    if (d.timeType === "night") return `${date} (午後)`;
    return `${date} (${d.timeType})`;
  };

  // 自分の回答保存
  const handleSave = async () => {
    try {
      // 🔹 schedule.dates を参照してキーを正規化
      const normalizedResponses = {};
      Object.entries(schedule.dates || {}).forEach(([date, d]) => {
        const key = getKey(date, d);
        normalizedResponses[key] = myResponses[date] || "-";
      });

      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          username,
          responses: normalizedResponses,
        }),
      });

      // 即時反映
      fetch(`/api/schedules/${token}/responses`)
        .then((res) => res.json())
        .then((data) => setResponses(data));

      socket.emit("updateResponses", token);

      setSaveMessage("保存しました！");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch {
      alert("保存に失敗しました");
    }
  };

  // 編集保存
  const handleEditSave = async () => {
    try {
      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: editingUser,
          username: editingUser,
          responses: editedResponses,
        }),
      });

      fetch(`/api/schedules/${token}/responses`)
        .then((res) => res.json())
        .then((data) => setResponses(data));

      socket.emit("updateResponses", token);
      setEditingUser(null);
    } catch {
      alert("保存に失敗しました");
    }
  };

  // 集計
  const summary = Object.entries(schedule.dates || {}).map(([date, d]) => {
    const key = getKey(date, d);
    const counts = { "◯": 0, "✕": 0, "△": 0 };
    responses.forEach((r) => {
      const val = r.responses?.[key];
      if (val && counts[val] !== undefined) counts[val]++;
    });
    return { date, d, key, counts };
  });

  // フィルター
  const filteredSummary = [...summary].sort((a, b) => {
    if (filter === "ok") return b.counts["◯"] - a.counts["◯"];
    if (filter === "ng") return b.counts["✕"] - a.counts["✕"];
    if (filter === "maybe") return b.counts["△"] - a.counts["△"];
    return 0;
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
          {Object.entries(schedule.dates || {}).map(([date, d], idx) => (
            <div key={idx} className="my-response-item">
              <span className="date-label">
                {date} （{getTimeLabel(d)}）
              </span>
              <select
                className="fancy-select"
                value={myResponses[date] || "-"}
                onChange={(e) =>
                  setMyResponses({ ...myResponses, [date]: e.target.value })
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
            {filteredSummary.map((item, idx) => (
              <tr key={idx}>
                <td>
                  {item.date} （{getTimeLabel(item.d)}）
                </td>
                <td>
                  <span className="count-ok">◯{item.counts["◯"]}</span>{" "}
                  <span className="count-ng">✕{item.counts["✕"]}</span>{" "}
                  <span className="count-maybe">△{item.counts["△"]}</span>
                </td>
                {responses.map((r, uIdx) => (
                  <td key={uIdx}>
                    {editingUser === r.username ? (
                      <select
                        className="fancy-select"
                        value={editedResponses[item.key] || "-"}
                        onChange={(e) =>
                          setEditedResponses({
                            ...editedResponses,
                            [item.key]: e.target.value,
                          })
                        }
                      >
                        <option value="-">- 未回答</option>
                        <option value="◯">◯ 参加</option>
                        <option value="✕">✕ 不参加</option>
                        <option value="△">△ 未定</option>
                      </select>
                    ) : (
                      r.responses?.[item.key] || "-"
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
