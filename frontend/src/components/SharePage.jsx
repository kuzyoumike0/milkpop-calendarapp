import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ShareLinkPage() {
  const { linkId } = useParams(); // URLからlinkIdを取得
  const [link, setLink] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({}); // { "date-timeslot": "◯" or "×" }
  const [message, setMessage] = useState("");

  // リンク情報取得
  useEffect(() => {
    axios.get(`/api/link/${linkId}`).then((res) => {
      setLink(res.data.link);
      // 日付でソート
      const sorted = [...res.data.schedules].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setSchedules(sorted);
    });
  }, [linkId]);

  // 回答送信
  const handleSubmit = async () => {
    if (!username.trim()) {
      setMessage("❌ ユーザー名を入力してください");
      return;
    }
    try {
      for (const s of schedules) {
        const key = `${s.date}-${s.timeslot}`;
        if (responses[key]) {
          await axios.post("/api/respond", {
            linkId,
            date: s.date,
            timeslot: s.timeslot,
            username,
            choice: responses[key],
          });
        }
      }
      setMessage("✅ 回答を送信しました");
    } catch (err) {
      console.error("回答送信エラー:", err);
      setMessage("❌ 回答送信に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {link ? (
        <>
          <h2>📅 {link.title}</h2>

          {/* ユーザー名入力 */}
          <div style={{ marginBottom: "10px" }}>
            <label>ユーザー名: </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="名前を入力"
              style={{ padding: "5px", width: "200px" }}
            />
          </div>

          {/* スケジュール一覧 */}
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>日付</th>
                <th>時間帯</th>
                <th>選択</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => {
                const key = `${s.date}-${s.timeslot}`;
                return (
                  <tr key={key}>
                    <td>{s.date}</td>
                    <td>
                      {s.timeslot}
                      {s.starttime && s.endtime
                        ? ` (${s.starttime}:00 - ${s.endtime}:00)`
                        : ""}
                    </td>
                    <td>
                      <select
                        value={responses[key] || ""}
                        onChange={(e) =>
                          setResponses({ ...responses, [key]: e.target.value })
                        }
                      >
                        <option value="">-</option>
                        <option value="◯">◯</option>
                        <option value="×">×</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* 送信ボタン */}
          <button
            onClick={handleSubmit}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            ✅ 回答を送信
          </button>

          {/* メッセージ */}
          {message && <p style={{ marginTop: "10px" }}>{message}</p>}
        </>
      ) : (
        <p>読み込み中...</p>
      )}
    </div>
  );
}
