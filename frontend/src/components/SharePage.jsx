import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../share.css";

export default function SharePage() {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  // スケジュール取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        if (!res.ok) throw new Error("スケジュール取得失敗");
        const data = await res.json();
        setSchedule(data);

        // 既存回答も取得
        const res2 = await fetch(`/api/schedules/${token}/responses`);
        if (res2.ok) {
          const list = await res2.json();
          setResponses(list);
        }
      } catch (err) {
        console.error("API取得エラー:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // プルダウン変更
  const handleChange = (date, value) => {
    setAnswers({ ...answers, [date]: value });
  };

  // 保存
  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    try {
      const payload = { username, responses: answers };
      const res = await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("保存失敗");
      const newRes = await res.json();
      setResponses(newRes); // 即反映
      alert("保存しました！");
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  if (loading) return <div className="share-page">読み込み中...</div>;
  if (!schedule) return <div className="share-page">スケジュールが見つかりません</div>;

  return (
    <div className="share-page">
      <h1 className="share-title">📅 {schedule.title}</h1>

      {/* 名前入力 */}
      <div className="username-input">
        <input
          type="text"
          placeholder="お名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* 日程一覧 */}
      <div className="date-list">
        {schedule.dates.map((d, i) => (
          <div key={i} className="date-item">
            <span className="date-label">
              {new Date(d.date).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <select
              value={answers[d.date] || ""}
              onChange={(e) => handleChange(d.date, e.target.value)}
            >
              <option value="">選択してください</option>
              <option value="○">○ 参加</option>
              <option value="✕">✕ 不参加</option>
            </select>
          </div>
        ))}
      </div>

      {/* 保存ボタン */}
      <button className="save-btn" onClick={handleSave}>
        保存
      </button>

      {/* 回答一覧 */}
      <div className="responses-list">
        <h2>みんなの回答</h2>
        <table>
          <thead>
            <tr>
              <th>名前</th>
              {schedule.dates.map((d, i) => (
                <th key={i}>
                  {new Date(d.date).toLocaleDateString("ja-JP", {
                    month: "numeric",
                    day: "numeric",
                  })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((r, i) => (
              <tr key={i}>
                <td>{r.username}</td>
                {schedule.dates.map((d, j) => (
                  <td key={j}>{r.responses[d.date] || "-"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
