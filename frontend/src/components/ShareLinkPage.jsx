import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [title, setTitle] = useState("");
  const [schedules, setSchedules] = useState([]); // [{date, timeslot}]
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({}); // { "2025-08-20-昼": "◯" }
  const [message, setMessage] = useState("");

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/link/${linkId}`);
        setTitle(res.data.title || "");

        // schedules が存在するかチェック
        if (res.data.schedules && Array.isArray(res.data.schedules)) {
          // 日付でソート
          const sorted = res.data.schedules.sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
          setSchedules(sorted);
        } else {
          setSchedules([]);
        }
      } catch (err) {
        console.error("データ取得エラー:", err);
        setMessage("❌ データ取得に失敗しました");
      }
    };
    fetchData();
  }, [linkId]);

  // 回答送信
  const handleSubmit = async () => {
    if (!username.trim()) {
      setMessage("❌ ユーザー名を入力してください");
      return;
    }
    try {
      await axios.post("/api/respond", {
        linkId,
        username,
        responses,
      });
      setMessage("✅ 回答を送信しました");
    } catch (err) {
      console.error("送信エラー:", err);
      setMessage("❌ 送信に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 共有ページ</h2>
      <h3>{title}</h3>

      {/* ユーザー名 */}
      <div style={{ marginBottom: "10px" }}>
        <label>名前: </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="あなたの名前"
          style={{ padding: "5px" }}
        />
      </div>

      {/* 日程リスト */}
      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>日付</th>
            <th>時間帯</th>
            <th>選択</th>
          </tr>
        </thead>
        <tbody>
          {schedules.length > 0 ? (
            schedules.map((s, idx) => {
              const key = `${s.date}-${s.timeslot}`;
              return (
                <tr key={idx}>
                  <td>{s.date}</td>
                  <td>
                    {s.timeslot === "custom"
                      ? `${s.starttime}:00 - ${s.endtime}:00`
                      : s.timeslot}
                  </td>
                  <td>
                    <select
                      value={responses[key] || ""}
                      onChange={(e) =>
                        setResponses({ ...responses, [key]: e.target.value })
                      }
                    >
                      <option value="">未選択</option>
                      <option value="◯">◯</option>
                      <option value="×">×</option>
                    </select>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="3">📭 登録された日程はありません</td>
            </tr>
          )}
        </tbody>
      </table>

      <button
        onClick={handleSubmit}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        ✅ 回答送信
      </button>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
}
