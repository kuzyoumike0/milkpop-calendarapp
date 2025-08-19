import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function LinkPage() {
  const { linkId } = useParams();
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [responses, setResponses] = useState({}); // { "2025-08-20": { "user1": "⭕", "user2": "❌" } }
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  // 初期ロード
  useEffect(() => {
    axios
      .get(`/api/link/${linkId}`)
      .then((res) => {
        setTitle(res.data.title);
        setDates(res.data.dates); // [{date, timeslot, startTime, endTime}]
        setResponses(res.data.responses || {});
      })
      .catch((err) => {
        console.error("リンク取得エラー:", err);
      });
  }, [linkId]);

  // 回答送信
  const handleResponse = async (date, answer) => {
    if (!username.trim()) {
      setMessage("❌ 名前を入力してください");
      return;
    }
    try {
      const res = await axios.post(`/api/respond/${linkId}`, {
        username,
        date,
        answer,
      });
      setResponses(res.data.responses);
      setMessage("✅ 回答を保存しました");
    } catch (err) {
      console.error("回答送信エラー:", err);
      setMessage("❌ 回答の保存に失敗しました");
    }
  };

  // 時間帯の表示
  const renderTimeslot = (d) => {
    if (d.timeslot === "custom") {
      return `${d.startTime}:00〜${d.endTime}:00`;
    }
    return d.timeslot;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 共有スケジュール</h2>
      <h3>{title}</h3>

      {/* 名前入力 */}
      <div style={{ marginBottom: "15px" }}>
        <label>名前: </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="例: 山田太郎"
          style={{ padding: "5px", width: "200px" }}
        />
      </div>

      {/* 日程一覧 */}
      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>日付</th>
            <th>時間帯</th>
            <th>あなたの回答</th>
            <th>他の回答</th>
          </tr>
        </thead>
        <tbody>
          {dates.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{renderTimeslot(d)}</td>
              <td>
                <button
                  onClick={() => handleResponse(d.date, "⭕")}
                  style={{ marginRight: "10px" }}
                >
                  ⭕
                </button>
                <button onClick={() => handleResponse(d.date, "❌")}>❌</button>
              </td>
              <td>
                {responses[d.date] ? (
                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    {Object.entries(responses[d.date]).map(([user, ans]) => (
                      <li key={user}>
                        {user}: {ans}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "まだ回答なし"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* メッセージ */}
      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
}
