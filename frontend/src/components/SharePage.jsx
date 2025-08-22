import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { id } = useParams();
  const [schedules, setSchedules] = useState([]); // 登録された日程
  const [votes, setVotes] = useState([]);         // 全員の投票
  const [name, setName] = useState("");           // 入力された名前
  const [loading, setLoading] = useState(true);

  // 初回ロード
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/schedules/${id}`);
        const data = await res.json();
        setSchedules(data.schedules || []);
        setVotes(data.votes || []);
      } catch (err) {
        console.error("❌ Failed to load share data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 自分の投票を変更
  const handleVoteChange = (date, value) => {
    const newVotes = [...votes];
    const idx = newVotes.findIndex(
      (v) => v.name === name && v.date === date
    );
    if (idx !== -1) {
      newVotes[idx].status = value;
    } else {
      newVotes.push({ name, date, status: value });
    }
    setVotes(newVotes);
  };

  // サーバーに保存
  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("⚠️ 名前を入力してください");
      return;
    }
    await fetch(`/api/schedules/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, votes }),
    });
    alert("✅ 投票を保存しました");
  };

  if (loading) return <p>読み込み中...</p>;

  return (
    <div className="page-container">
      <h2 className="page-title">スケジュール調整</h2>

      {/* 名前入力 */}
      <div className="name-input">
        <input
          type="text"
          placeholder="あなたの名前を入力"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* 表形式で日程を表示 */}
      <table className="schedule-table">
        <thead>
          <tr>
            <th>日付</th>
            <th>タイプ</th>
            <th colSpan="3">あなたの選択</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, idx) => {
            const myVote =
              votes.find((v) => v.name === name && v.date === s.date)?.status ||
              "未定";
            return (
              <tr key={idx}>
                <td>{s.date}</td>
                <td>{s.type === "時間指定" ? `${s.start} - ${s.end}` : s.type}</td>
                <td>
                  <input
                    type="radio"
                    name={`vote-${s.date}`}
                    value="参加"
                    checked={myVote === "参加"}
                    onChange={() => handleVoteChange(s.date, "参加")}
                  />
                  参加
                </td>
                <td>
                  <input
                    type="radio"
                    name={`vote-${s.date}`}
                    value="不参加"
                    checked={myVote === "不参加"}
                    onChange={() => handleVoteChange(s.date, "不参加")}
                  />
                  不参加
                </td>
                <td>
                  <input
                    type="radio"
                    name={`vote-${s.date}`}
                    value="未定"
                    checked={myVote === "未定"}
                    onChange={() => handleVoteChange(s.date, "未定")}
                  />
                  未定
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button onClick={handleSubmit} className="submit-btn">
        投票を保存
      </button>
    </div>
  );
};

export default SharePage;
