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

  // ===== 編集モード =====
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");

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

  // ===== 自分の回答変更 =====
  const handleChange = (dateKey, value) => {
    setResponses((prev) => ({
      ...prev,
      [dateKey]: value,
    }));
  };

  // ===== 自分の回答保存 =====
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
    await fetch(`/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(res),
    });
    setSaveMessage("保存しました！");
  };

  // ===== セル編集保存（みんなの回答） =====
  const handleCellSave = async () => {
    if (!editingCell) return;
    const { user, dateKey } = editingCell;

    const userResponse = allResponses.find((r) => r.username === user);
    if (!userResponse) return;

    const updatedResponses = {
      ...userResponse.responses,
      [dateKey]: editValue,
    };

    await fetch(`/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userResponse.user_id,
        username: userResponse.username,
        responses: updatedResponses,
      }),
    });

    setEditingCell(null);
    setEditValue("");
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
          {schedule?.dates?.map((d) => {
            const dateKey =
              d.timeType === "時間指定" && d.startTime && d.endTime
                ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                : `${d.date} (${d.timeType})`;
            return (
              <div key={dateKey} className="my-response-item">
                <span className="date-label">{formatDate(d)}</span>
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
        </div>
        <button className="save-btn" onClick={handleSave}>
          保存する
        </button>
        {saveMessage && <p className="save-message">{saveMessage}</p>}
      </div>

      {/* みんなの回答 */}
      <div className="all-responses">
        <h2>みんなの回答</h2>
        <div className="responses-grid">
          {schedule?.dates?.map((d) => {
            const dateKey =
              d.timeType === "時間指定" && d.startTime && d.endTime
                ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                : `${d.date} (${d.timeType})`;

            const counts = { "○": 0, "✖": 0, "△": 0, "-": 0 };
            allResponses.forEach((r) => {
              const val = r.responses?.[dateKey] || "-";
              if (counts[val] !== undefined) counts[val]++;
            });

            return (
              <div key={dateKey} className="response-card">
                <div className="response-header">
                  <span className="date-label">{formatDate(d)}</span>
                  <span className="count-label">
                    ○{counts["○"]} ✖{counts["✖"]} △{counts["△"]}
                  </span>
                </div>
                <div className="response-users">
                  {allResponses.map((r) => (
                    <div
                      key={r.user_id + dateKey}
                      className="user-response"
                      onClick={() => {
                        setEditingCell({ user: r.username, dateKey });
                        setEditValue(r.responses?.[dateKey] || "-");
                      }}
                    >
                      <span className="username">{r.username}</span>
                      {editingCell?.user === r.username &&
                      editingCell?.dateKey === dateKey ? (
                        <select
                          className="attendance-select"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                        >
                          {attendanceOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="response-value">
                          {r.responses?.[dateKey] || "-"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {editingCell && (
          <button className="save-btn" onClick={handleCellSave}>
            編集内容を保存
          </button>
        )}
      </div>
    </div>
  );
};

export default SharePage;
