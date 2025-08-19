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
  const [answers, setAnswers] = useState({}); // ユーザー選択一時保存

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/link/${linkId}`);
        setTitle(res.data.title);
        // 日付と時間帯でソート
        const sorted = [...(res.data.schedules || [])].sort((a, b) => {
          if (a.date === b.date) {
            return (a.starttime || 0) - (b.starttime || 0);
          }
          return new Date(a.date) - new Date(b.date);
        });
        setSchedules(sorted);
        setResponses(res.data.responses || []);
      } catch (err) {
        console.error("リンク取得エラー:", err);
        setMessage("❌ リンクの読み込みに失敗しました");
      }
    };
    fetchData();
  }, [linkId]);

  // プルダウン変更
  const handleSelectChange = (date, timeslot, value) => {
    setAnswers((prev) => ({
      ...prev,
      [`${date}_${timeslot}`]: value,
    }));
  };

  // 保存処理
  const handleSave = async () => {
    if (!username.trim()) {
      setMessage("❌ 名前を入力してください");
      return;
    }

    try {
      const payload = Object.entries(answers).map(([key, status]) => {
        const [date, timeslot] = key.split("_");
        return { scheduleId: linkId, date, timeslot, username, status };
      });

      await axios.post("/api/respond-bulk", { responses: payload });

      // フロント側でも更新
      setResponses((prev) => {
        const filtered = prev.filter((r) => r.username !== username);
        return [...filtered, ...payload];
      });

      setMessage("✅ 回答を保存しました");
    } catch (err) {
      console.error("保存エラー:", err);
      setMessage("❌ 保存に失敗しました");
    }
  };

  // 特定日付・時間帯の回答取得
  const getResponsesForDate = (date, timeslot) =>
    responses.filter((r) => r.date === date && r.timeslot === timeslot);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 共有スケジュール: {title}</h2>

      {/* 名前入力 */}
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

      {/* スケジュール一覧 */}
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
              <th>あなたの回答</th>
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
                  <select
                    value={answers[`${s.date}_${s.timeslot}`] || ""}
                    onChange={(e) =>
                      handleSelectChange(s.date, s.timeslot, e.target.value)
                    }
                  >
                    <option value="">未選択</option>
                    <option value="◯">◯</option>
                    <option value="×">×</option>
                  </select>
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
                      {r.username}: {r.status}
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

      <button
        onClick={handleSave}
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        保存
      </button>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
}
