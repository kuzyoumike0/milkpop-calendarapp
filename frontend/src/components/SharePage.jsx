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

  // timeType → 日本語ラベル変換
  const timeLabel = (t) => {
    if (t === "allday") return "終日";
    if (t === "day") return "午前";
    if (t === "night") return "午後";
    if (t === "custom") return "時間指定";
    return t;
  };

  // 共通のキー生成
  const buildKey = (date, d) => {
    if (d.timeType === "custom" && d.startTime && d.endTime) {
      return `${date} (${d.startTime} ~ ${d.endTime})`;
    }
    return `${date} (${timeLabel(d.timeType)})`;
  };

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

  // 自分の回答保存
  const handleSave = async () => {
    if (!username.trim()) {
      alert("名前を入力してください");
      return;
    }

    try {
      const res = await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          username,
          responses: myResponses,
        }),
      });
      await res.json();

      // 即時反映（自分の回答を responses にマージ）
      setResponses((prev) => {
        const others = prev.filter((r) => r.user_id !== userId);
        return [...others, { user_id: userId, username, responses: myResponses }];
      });

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
      const res = await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: editingUser,
          username: editingUser,
          responses: editedResponses,
        }),
      });
      await res.json();

      // 即時反映（編集したユーザの回答を更新）
      setResponses((prev) => {
        const others = prev.filter((r) => r.user_id !== editingUser);
        return [
          ...others,
          { user_id: editingUser, username: editingUser, responses: editedResponses },
        ];
      });

      socket.emit("updateResponses", token);
      setEditingUser(null);
    } catch {
      alert("保存に失敗しました");
    }
  };

  // 集計
  const summary = (schedule.dates || []).map((d) => {
    const key = buildKey(d.date, d);
    const counts = { "◯": 0, "✕": 0, "△": 0 };
    responses.forEach((r) => {
      const val = r.responses?.[key];
      if (val && counts[val] !== undefined) counts[val]++;
    });
    return { ...d, key, counts };
  });

  // フィルター適用
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
          {(schedule.dates || []).map((d, idx) => {
            const key = buildKey(d.date, d);
            return (
              <div key={idx} className="my-response-item">
                <span className="date-label">{key}</span>
                <select
                  className="fancy-select"
                  value={myResponses[key] || "-"}
                  onChange={(e) =>
                    setMyResponses({ ...myResponses, [key]: e.target.value })
                  }
                >
                  <option value="-">- 未回答</option>
                  <option value="◯">◯ 参加</option>
                  <option value="✕">✕ 不参加</option>
                  <option value="△">△ 未定</option>
                </select>
              </div>
            );
          })}
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
                      setEditingUser(r.user_id);
                      setEditedResponses(r.responses);
                    }}
                  >
                    {r.username && r.username.trim() !== "" ? r.username : "未入力"}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSummary.map((d, idx) => (
              <tr key={idx}>
                <td>{d.key}</td>
                <td>
                  <span className="count-ok">◯{d.counts["◯"]}</span>{" "}
                  <span className="count-ng">✕{d.counts["✕"]}</span>{" "}
                  <span className="count-maybe">△{d.counts["△"]}</span>
                </td>
                {responses.map((r, uIdx) => (
                  <td key={uIdx}>
                    {editingUser === r.user_id ? (
                      <select
                        className="fancy-select"
                        value={editedResponses[d.key] || "-"}
                        onChange={(e) =>
                          setEditedResponses({
                            ...editedResponses,
                            [d.key]: e.target.value,
                          })
                        }
                      >
                        <option value="-">- 未回答</option>
                        <option value="◯">◯ 参加</option>
                        <option value="✕">✕ 不参加</option>
                        <option value="△">△ 未定</option>
                      </select>
                    ) : (
                      r.responses?.[d.key] || "-"
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
