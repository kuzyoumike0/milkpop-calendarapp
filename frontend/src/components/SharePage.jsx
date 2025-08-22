import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [votes, setVotes] = useState({}); // 各行ごとの出欠を保持

  useEffect(() => {
    // ✅ 仮のAPI呼び出し（本番ではExpress側から取得）
    fetch(`/api/schedules/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setSchedule(data);

        // 初期値は「未定」にする
        const initialVotes = {};
        data.dates.forEach((d, index) => {
          initialVotes[index] = "未定";
        });
        setVotes(initialVotes);
      });
  }, [id]);

  // ✅ 出欠の変更
  const handleVoteChange = (index, value) => {
    setVotes((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  // ✅ 出欠を送信
  const handleSubmit = () => {
    console.log("送信データ:", votes);
    // ここで Express API に POST する想定
    alert("出欠を登録しました！");
  };

  if (!schedule) return <p>読み込み中...</p>;

  return (
    <div className="page-container">
      <h2 className="page-title">出欠登録ページ</h2>

      <div className="schedule-table-wrapper">
        <table className="fancy-table">
          <thead>
            <tr>
              <th>日付</th>
              <th>区分</th>
              <th>出欠</th>
            </tr>
          </thead>
          <tbody>
            {schedule.dates.map((d, index) => (
              <tr key={index}>
                <td>{d.date}</td>
                <td>{d.type}</td>
                <td>
                  <select
                    className="vote-select"
                    value={votes[index] || "未定"}
                    onChange={(e) => handleVoteChange(index, e.target.value)}
                  >
                    <option value="参加">参加</option>
                    <option value="不参加">不参加</option>
                    <option value="未定">未定</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="fancy-btn" onClick={handleSubmit}>
        出欠を送信する
      </button>
    </div>
  );
};

export default SharePage;
