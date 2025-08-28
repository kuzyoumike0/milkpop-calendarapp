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
  const [editMode, setEditMode] = useState(false);
  const [editedResponses, setEditedResponses] = useState({});
  const [saveMessage, setSaveMessage] = useState("");

  // スケジュール取得
  useEffect(() => {
    fetch(`/api/schedules/${token}`)
      .then((res) => res.json())
      .then((data) => setSchedule(data))
      .catch((err) => console.error("取得失敗:", err));

    fetch(`/api/schedules/${token}/responses`)
      .then((res) => res.json())
      .then((data) => setResponses(data))
      .catch((err) => console.error("回答取得失敗:", err));

    socket.emit("joinSchedule", token);

    socket.on("scheduleUpdated", () => {
      fetch(`/api/schedules/${token}/responses`)
        .then((res) => res.json())
        .then((data) => setResponses(data));
    });

    return () => {
      socket.off("scheduleUpdated");
    };
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

  // 保存
  const handleSave = async () => {
    try {
      const res = await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          responses: myResponses,
        }),
      });
      if (!res.ok) throw new Error("保存失敗");
      const updated = await res.json();
      setResponses(updated);
      socket.emit("updateSchedule", token);
      setSaveMessage("保存しました！");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch (err) {
      console.error("保存エラー:", err);
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
          username,
          responses: editedResponses,
        }),
      });
      if (!res.ok) throw new Error("保存失敗");
      const updated = await res.json();
      setResponses(updated);
      socket.emit("updateSchedule", token);
      setEditMode(false);
    } catch (err) {
      console.error("編集保存エラー:", err);
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
        <div style={{ marginBottom: "12px" }}>
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

        <div className="table-container">
          <table className="responses-table">
            <thead>
              <tr>
                <th>日付</th>
                <th>回答数</th>
                {responses.map((r, idx) => (
                  <th key={idx}>{r.username}</th>
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
                      {editMode && r.username === username ? (
                        <select
                          className="fancy-select"
                          value={editedResponses[d.date] || r.responses[d.date] || "-"}
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

          {responses.some((r) => r.username === username) && (
            <div className="edit-save-bar">
              {!editMode ? (
                <button
                  className="username-save-btn"
                  onClick={() => {
                    const myData = responses.find((r) => r.username === username);
                    setEditedResponses(myData ? myData.responses : {});
                    setEditMode(true);
                  }}
                >
                  編集する
                </button>
              ) : (
                <button className="username-save-btn" onClick={handleEditSave}>
                  編集を保存
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
