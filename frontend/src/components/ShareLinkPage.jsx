import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [title, setTitle] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/link/${linkId}`);
        setTitle(res.data.title);
        setSchedules(res.data.schedules || []);
        setResponses(res.data.responses || []);
      } catch (err) {
        console.error("リンク取得エラー:", err);
        setMessage("❌ リンクの読み込みに失敗しました");
      }
    };
    fetchData();
  }, [linkId]);

  // 回答送信
  const handleRespond = async (date, timeslot, choice) => {
    if (!username.trim()) {
      setMessage("❌ 名前を入力してください");
      return;
    }
    try {
      await axios.post("/api/participant", {
        scheduleId: linkId,
        date,
        timeslot,
        username,
        status: choice, // ◯ or ×
      });

      setResponses((prev) => {
        const filtered = prev.filter(
          (r) =>
            !(
              r.username === username &&
              r.date === date &&
              r.timeslot === timeslot
            )
        );
        return [...filtered, { username, date, timeslot, choice }];
      });

      setMessage("✅ 回答を保存しました");
    } catch (err) {
      console.error("回答送信エラー:", err);
      setMessage("❌ 回答送信に失敗しました");
    }
  };

  // 回答削除
  const handleDelete = async (date, timeslot) => {
    if (!username.trim()) {
      setMessage("❌ 名前を入力してください");
      return;
    }
    try {
      await axios.delete("/api/participant", {
        data: {
          scheduleId: linkId,
          date,
          timeslot,
          username,
        },
      });

      setResponses((prev) =>
        prev.filter(
          (r) =>
            !(
              r.username === username &&
              r.date === date &&
              r.timeslot === timeslot
            )
        )
      );

      setMessage("✅ 回答を削除しました");
    } catch (err) {
      console.error("削除エラー:", err);
      setMessage("❌ 回答削除に失敗しました");
    }
  };

  // 特定の日付に対する回答まとめ
  const getResponsesForDate = (date, timeslot) => {
    return responses.filter((r) => r.date === date && r.timeslot === timeslot);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 共有スケジュール: {title}</h2>

      {/* ユーザー名入力 */}
      <div style={{ marginBottom: "15px" }}>
        <label>名前: </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="あなたの名前"
          style={{ padding: "5px" }}
        />
      </div>

      {/* 日付一覧 */}
      {schedules.length > 0 ? (
        <table
          border="1"
          cellPadding="8"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th>日付</th>
              <th>時間帯</th>
              <th>参加可否</th>
              <th>回答一覧</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, idx) => (
              <tr key={idx}>
                <td>{s.date}</td>
                <td>
                  {s.timeslot === "custom"
                    ? `${s.starttime}:00 - ${s.endtime}:00`
                    : s.timeslot}
                </td>
                <td>
                  <button
                    onClick={() => handleRespond(s.date, s.timeslot, "◯")}
                    style={{ marginRight: "5px" }}
                  >
                    ◯
                  </button>
                  <button
                    onClick={() => handleRespond(s.date, s.timeslot, "×")}
                    style={{ marginRight: "5px" }}
                  >
                    ×
                  </button>
                  <button
                    onClick={() => handleDelete(s.date, s.timeslot)}
                    style={{ color: "red" }}
                  >
                    削除
                  </button>
                </td>
                <td>
                  {getResponsesForDate(s.date, s.timeslot).map((r, i) => (
                    <div
                      key={i}
                      style={{
                        fontWeight:
                          r.username === username ? "bold" : "normal",
                      }}
                    >
                      {r.username}: {r.choice || r.status}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>日付が登録されていません。</p>
      )}

      {/* メッセージ */}
      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
}
