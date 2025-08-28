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
  const fetchResponses = async () => {
    try {
      const res2 = await fetch(`/api/schedules/${token}/responses`);
      if (res2.ok) {
        const list = await res2.json();
        setResponses(list);
      }
    } catch (err) {
      console.error("回答一覧取得エラー:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        if (!res.ok) throw new Error("スケジュール取得失敗");
        const data = await res.json();
        setSchedule(data);

        await fetchResponses();
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

  // 自分の回答保存
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
  const aggregateResponses = () => {
    const agg = {};
    responses.forEach((r) => {
      Object.entries(r.responses).forEach(([date, resp]) => {
        if (!agg[date]) {
          agg[date] = { ok: 0, ng: 0, maybe: 0, users: [] };
        }
        if (resp === "○" || resp === "ok") agg[date].ok++;
        if (resp === "✕" || resp === "ng") agg[date].ng++;
        if (resp === "△" || resp === "maybe") agg[date].maybe++;
        agg[date].users.push({
          user_id: r.id,
          username: r.username,
          response: resp,
        });
      });
    });
    return agg;
  };

  // 並べ替え後の日付リスト
  const getSortedDates = () => {
    if (!schedule) return [];
    let sorted = [...schedule.dates];
    const agg = aggregateResponses();

    sorted.sort((a, b) => {
      const ca = agg[a.date] || { ok: 0, ng: 0, maybe: 0 };
      const cb = agg[b.date] || { ok: 0, ng: 0, maybe: 0 };

      if (filter === "ok") return cb.ok - ca.ok;
      if (filter === "ng") return cb.ng - ca.ng;
      if (filter === "maybe") return cb.maybe - ca.maybe;
      return new Date(a.date) - new Date(b.date); // デフォルトは日付順
    });

    return sorted;
  };

  if (loading) return <div className="share-container">読み込み中...</div>;
  if (!schedule) return <div className="share-container">スケジュールが見つかりません</div>;

  const aggregated = aggregateResponses();
  const userList = [...new Set(responses.map((r) => r.username))];

  return (
    <div className="share-container">
      <h1 className="share-title">MilkPOP Calendar</h1>

      {/* 自分の回答 */}
      <div className="my-responses gradient-box">
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
      <div className="all-responses gradient-box">
        <h2>みんなの回答</h2>

        {/* フィルタ */}
        <div className="filter-box">
          <span>フィルタ：</span>
          <select
            className="fancy-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">すべて表示</option>
            <option value="ok">○ 多い順</option>
            <option value="ng">✕ 多い順</option>
            <option value="maybe">△ 多い順</option>
          </select>
        </div>

        {/* マトリクス表 */}
        <div className="table-container">
          <table className="responses-table">
            <thead>
              <tr>
                <th>日付</th>
                <th>回答数</th>
                {userList.map((uname, idx) => (
                  <th key={idx}>{uname}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getSortedDates().map((d, i) => {
                const counts = aggregated[d.date] || { ok: 0, ng: 0, maybe: 0, users: [] };
                return (
                  <tr key={i}>
                    {/* 日付 */}
                    <td>
                      {new Date(d.date).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {d.timeType && `（${d.timeType}）`}
                      {d.startTime && d.endTime && ` (${d.startTime} ~ ${d.endTime})`}
                    </td>

                    {/* 回答数 */}
                    <td>
                      <span className="count-ok">○{counts.ok}</span>
                      <span className="count-ng"> ✕{counts.ng}</span>
                      <span className="count-maybe"> △{counts.maybe}</span>
                    </td>

                    {/* 各ユーザの回答 */}
                    {userList.map((uname, idx) => {
                      const userResponse = counts.users.find((u) => u.username === uname);
                      let symbol = "–";
                      if (userResponse?.response === "○" || userResponse?.response === "ok") symbol = "○";
                      if (userResponse?.response === "✕" || userResponse?.response === "ng") symbol = "✕";
                      if (userResponse?.response === "△" || userResponse?.response === "maybe") symbol = "△";
                      return <td key={idx}>{symbol}</td>;
                    })}
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
