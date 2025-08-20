import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({});

  // スケジュール取得
  const fetchSchedules = async () => {
    const res = await axios.get("/api/schedules", { params: { linkid } });
    setSchedules(res.data);
  };

  useEffect(() => {
    fetchSchedules();
  }, [linkid]);

  // プルダウン変更
  const handleChange = (scheduleId, value) => {
    setResponses({
      ...responses,
      [scheduleId]: value,
    });
  };

  // 保存処理
  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    const payload = Object.entries(responses).map(([scheduleId, response]) => ({
      schedule_id: scheduleId,
      username,
      response,
    }));

    await axios.post("/api/share-responses", payload);
    await fetchSchedules(); // 即時反映
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール回答ページ</h2>

      <div>
        <input
          type="text"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          marginTop: "20px",
          border: "1px solid #ccc",
        }}
      >
        <thead>
          <tr style={{ background: "#FDB9C8", color: "#fff" }}>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>日付</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>時間帯</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>出欠</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>回答一覧</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => (
            <tr key={s.id}>
              <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                {s.date}
              </td>
              <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                {s.timeslot}
              </td>
              <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                <select
                  value={responses[s.id] || ""}
                  onChange={(e) => handleChange(s.id, e.target.value)}
                >
                  <option value="">未選択</option>
                  <option value="○">○</option>
                  <option value="✕">✕</option>
                </select>
              </td>
              <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                {Array.isArray(s.responses) &&
                  s.responses.map((r, idx) => (
                    <div key={idx}>
                      {r.username}: {r.response}
                    </div>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#004CA0",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={handleSave}
      >
        保存
      </button>
    </div>
  );
}
