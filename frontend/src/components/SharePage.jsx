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

  // ===== スケジュール読み込み =====
  useEffect(() => {
    const fetchSchedule = async () => {
      const res = await fetch(`/api/schedules/${token}`);
      if (res.ok) {
        const data = await res.json();
        setSchedule(data);
      }
    };

    const fetchResponses = async () => {
      const res = await fetch(`/api/schedules/${token}/responses`);
      if (res.ok) {
        const data = await res.json();
        setAllResponses(data);
      }
    };

    fetchSchedule();
    fetchResponses();

    socket.emit("joinSchedule", token);

    socket.on("updateResponses", (data) => {
      setAllResponses((prev) => {
        const exists = prev.find((r) => r.user_id === data.user_id);
        if (exists) {
          return prev.map((r) => (r.user_id === data.user_id ? data : r));
        }
        return [data, ...prev];
      });
    });

    socket.on("deleteResponse", (data) => {
      setAllResponses((prev) => prev.filter((r) => r.user_id !== data.user_id));
    });

    return () => {
      socket.off("updateResponses");
      socket.off("deleteResponse");
    };
  }, [token]);

  // ===== 回答変更 =====
  const handleResponseChange = (dateKey, value) => {
    setResponses((prev) => ({
      ...prev,
      [dateKey]: value,
    }));
  };

  // ===== 保存処理 =====
  const handleSave = async () => {
    if (!username.trim()) {
      setSaveMessage("⚠️ 名前を入力してください");
      return;
    }

    const newResponse = {
      user_id: userId,
      username,
      responses,
    };

    // 即時反映（楽観的更新）
    setAllResponses((prev) => {
      const exists = prev.find((r) => r.user_id === userId);
      if (exists) {
        return prev.map((r) => (r.user_id === userId ? newResponse : r));
      }
      return [newResponse, ...prev];
    });

    try {
      const res = await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResponse),
      });

      if (res.ok) {
        setSaveMessage("✅ 保存しました");
      } else {
        setSaveMessage("❌ 保存に失敗しました");
      }
    } catch (err) {
      console.error("保存エラー:", err);
      setSaveMessage("❌ 保存エラー");
    }
  };

  if (!schedule) return <div>読み込み中...</div>;

  const dates = schedule.dates;

  return (
    <div className="share-page">
      <h2>共有スケジュール</h2>

      <div className="glass-card">
        <label>
          名前：
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="あなたの名前"
          />
        </label>

        <table className="response-table">
          <thead>
            <tr>
              <th>日程</th>
              <th>回答</th>
            </tr>
          </thead>
          <tbody>
            {dates.map((d, idx) => {
              const key =
                d.type === "時間指定" && d.startHour !== undefined
                  ? `${d.date} (${d.startHour}~${d.endHour})`
                  : `${d.date} (${d.type})`;
              return (
                <tr key={idx}>
                  <td>{key}</td>
                  <td>
                    <select
                      value={responses[key] || "-"}
                      onChange={(e) => handleResponseChange(key, e.target.value)}
                    >
                      {attendanceOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <button onClick={handleSave} className="save-btn">
          保存
        </button>
        {saveMessage && <p className="save-msg">{saveMessage}</p>}
      </div>

      <div className="glass-card">
        <h3>みんなの回答</h3>
        <ul>
          {allResponses.map((r, idx) => (
            <li key={idx}>
              <strong>{r.username}</strong>：{" "}
              {Object.entries(r.responses)
                .map(([k, v]) => `${k}=${v}`)
                .join(", ")}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SharePage;
