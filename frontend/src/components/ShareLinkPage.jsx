import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [linkData, setLinkData] = useState(null);
  const [responses, setResponses] = useState({});
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const res = await axios.get(`/api/link/${linkId}`);
        setLinkData(res.data.link);
        setResponses(res.data.responses || {});
      } catch (err) {
        console.error("リンク読み込みエラー:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLink();
  }, [linkId]);

  const handleResponse = async (date, timeslot, value) => {
    if (!username.trim()) {
      alert("名前を入力してください");
      return;
    }
    try {
      await axios.post(`/api/respond/${linkId}`, {
        username,
        date,
        timeslot,
        value,
      });
      setResponses((prev) => {
        const key = `${date}_${timeslot}`;
        return {
          ...prev,
          [key]: [...(prev[key] || []), { username, value }],
        };
      });
    } catch (err) {
      console.error("回答送信エラー:", err);
    }
  };

  if (loading) return <p>⏳ 読み込み中...</p>;
  if (!linkData) return <p>❌ リンクが存在しません</p>;

  // === 日付・時間帯ごとにグループ化して表示 ===
  const groupedSchedules = {};
  linkData.schedules.forEach((s) => {
    if (!groupedSchedules[s.date]) groupedSchedules[s.date] = [];
    groupedSchedules[s.date].push(s);
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 {linkData.title}</h2>

      {/* 名前入力 */}
      <div style={{ marginBottom: "10px" }}>
        <label>あなたの名前: </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="例: 山田太郎"
          style={{ padding: "5px", width: "200px" }}
        />
      </div>

      {Object.entries(groupedSchedules).map(([date, slots]) => (
        <div
          key={date}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "15px",
          }}
        >
          <h3>{date}</h3>
          <table
            border="1"
            cellPadding="5"
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
            <thead>
              <tr>
                <th>時間帯</th>
                <th>回答</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s, idx) => {
                const key = `${s.date}_${s.timeslot}`;
                return (
                  <tr key={idx}>
                    <td>{s.timeslot}</td>
                    <td>
                      {(responses[key] || []).map((r, i) => (
                        <span
                          key={i}
                          style={{
                            marginRight: "10px",
                            color: r.value === "○" ? "green" : "red",
                          }}
                        >
                          {r.username} ({r.value})
                        </span>
                      ))}
                    </td>
                    <td>
                      <button
                        onClick={() => handleResponse(s.date, s.timeslot, "○")}
                        style={{ marginRight: "5px" }}
                      >
                        ○
                      </button>
                      <button
                        onClick={() => handleResponse(s.date, s.timeslot, "×")}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
