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
  const [filter, setFilter] = useState("all");

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

  // 回答集計
  const countResponses = (date) => {
    let count = { "○": 0, "✕": 0, "△": 0 };
    responses.forEach((r) => {
      const val = r.responses[date];
      if (val && count[val] !== undefined) count[val]++;
    });
    return count;
  };

  if (loading) return <div className="share-container">読み込み中...</div>;
  if (!schedule) return <div className="share-container">スケジュールが見つかりません</div>;

  return (
    <div className="share-container">
      <h1 className="share-title">MilkPOP Calendar</h1>

      {/* 自分の回答 */}
      <div className="my-responses">
        <h2>自分の回答</h2>
        <input
          type="text"
          className="username-input"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="my-responses-list">
          {schedule.dates.map((d, i) => (
            <div key={i} className="my-response-item">
              <span className="date-label">
                {new Date(d.date).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {d.timeType && `（${d.timeType}）`}
                {d.startTime && d.endTime && ` (${d.startTime} ~ ${d.endTime})`}
              </span>
              <select
                className="fancy-select"
                value={answers[d.date] || ""}
                onChange={(e) => handleChange(d.date, e.target.value)}
              >
                <option value="">- 未回答</option>
                <option value="○">○ 参加</option>
                <option value="✕">✕ 不参加</option>
                <option value="△">△ 未定</option>
              </select>
            </div>
          ))}
        </div>

        <button className="save-btn" onClick={handleSave}>
          保存する
        </button>
        {saveMessage && <div className="save-message">{saveMessage}</div>}
      </div>

      {/* みんなの回答 */}
      <div className="all-responses">
        <h2>みんなの回答</h2>

        <div>
          フィルタ：
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">すべて表示</option>
            <option value="ok">○ 多い順</option>
            <option value="ng">✕ 多い順</option>
            <option value="maybe">△ 多い順</option>
          </select>
        </div>

        <div className="table-container">
          <table className="responses-table">
            <thead>
              <tr>
                <th>日付</th>
                <th>回答数</th>
              </tr>
            </thead>
            <tbody>
              {schedule.dates.map((d, i) => {
                const counts = countResponses(d.date);
                return (
                  <tr key={i}>
                    <td>
                      {new Date(d.date).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {d.timeType && `（${d.timeType}）`}
                      {d.startTime && d.endTime && ` (${d.startTime} ~ ${d.endTime})`}
                    </td>
                    <td>
                      <span className="count-ok">○{counts["○"]}</span>{" "}
                      <span className="count-ng">✕{counts["✕"]}</span>{" "}
                      <span className="count-maybe">△{counts["△"]}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
