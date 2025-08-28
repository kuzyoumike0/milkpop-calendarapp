import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../share.css";

export default function SharePage() {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState({});
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // スケジュール取得 & 回答一覧取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        if (!res.ok) throw new Error("スケジュール取得失敗");
        const data = await res.json();
        setSchedule(data);

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

  // 保存処理
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
      setSaveMessage("✅ 保存しました！");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  if (loading) return <div className="share-container">読み込み中...</div>;
  if (!schedule) return <div className="share-container">スケジュールが見つかりません</div>;

  return (
    <div className="share-container">
      <h1 className="share-title">📅 {schedule.title}</h1>

      {/* 自分の回答 */}
      <div className="my-responses">
        <input
          type="text"
          className="username-input"
          placeholder="お名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="my-responses-list">
          {schedule.dates.map((d, i) => (
            <div key={i} className="my-response-item">
              <span className="date-label">
                {new Date(d.date).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                })}
              </span>
              <select
                className="fancy-select"
                value={answers[d.date] || ""}
                onChange={(e) => handleChange(d.date, e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="○">○ 参加</option>
                <option value="✕">✕ 不参加</option>
                <option value="△">△ 未定</option>
              </select>
            </div>
          ))}
        </div>

        <button className="save-btn" onClick={handleSave}>
          保存
        </button>
        {saveMessage && <div className="save-message">{saveMessage}</div>}
      </div>

      {/* みんなの回答 */}
      <div className="all-responses">
        <h2>みんなの回答</h2>
        <div className="table-container">
          <table className="responses-table">
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
                  <td className="editable-username">{r.username}</td>
                  {schedule.dates.map((d, j) => {
                    const val = r.responses[d.date] || "-";
                    let cls = "";
                    if (val === "○") cls = "count-ok";
                    else if (val === "✕") cls = "count-ng";
                    else if (val === "△") cls = "count-maybe";
                    return (
                      <td key={j} className={cls}>
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
