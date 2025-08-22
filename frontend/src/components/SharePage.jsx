import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { id } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [votes, setVotes] = useState({});
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchSchedules = async () => {
      const res = await fetch(`/api/schedules/${id}`);
      const data = await res.json();
      setSchedules(data.schedules || []);
    };
    fetchSchedules();
  }, [id]);

  const handleVoteChange = (scheduleId, value) => {
    setVotes({ ...votes, [scheduleId]: value });
  };

  const handleSubmit = async () => {
    if (!name) {
      alert("名前を入力してください");
      return;
    }

    const payload = { name, votes };

    await fetch(`/api/schedules/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("投票を送信しました！");
  };

  return (
    <div className="page-container">
      <h2 className="page-title">✨ 共有スケジュール ✨</h2>

      {/* 名前入力 */}
      <div className="name-input stylish-box">
        <label>
          あなたの名前:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 山田太郎"
          />
        </label>
      </div>

      {/* スケジュール調整表 */}
      <div className="schedule-table-wrapper">
        <table className="schedule-table fancy-table">
          <thead>
            <tr>
              <th>📅 日付</th>
              <th>🕑 区分</th>
              <th>✅ 出欠</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, idx) => (
              <tr key={idx}>
                <td>{s.date}</td>
                <td>{s.type}</td>
                <td>
                  <select
                    className="vote-select"
                    value={votes[s.id] || ""}
                    onChange={(e) => handleVoteChange(s.id, e.target.value)}
                  >
                    <option value="">未選択</option>
                    <option value="参加">🌸 参加</option>
                    <option value="不参加">❌ 不参加</option>
                    <option value="未定">💭 未定</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="submit-btn fancy-btn" onClick={handleSubmit}>
        🚀 投票を送信
      </button>
    </div>
  );
};

export default SharePage;
