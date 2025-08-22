import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { id } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState({}); // { date: "◯/✕" }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/share/${id}`);
        const data = await res.json();
        // 日付でソート
        const sorted = data.schedules.sort((a, b) =>
          a.date.localeCompare(b.date)
        );
        setSchedules(sorted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (date, value) => {
    setAnswers((prev) => ({ ...prev, [date]: value }));
  };

  const handleSubmit = () => {
    alert(`ユーザー: ${username}\n回答: ${JSON.stringify(answers, null, 2)}`);
    // TODO: サーバーに送信するAPIを作る
  };

  return (
    <div className="page-container">
      <h2 className="page-title">共有スケジュール</h2>
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <input
          type="text"
          placeholder="お名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
      </div>
      <div className="schedule-section">
        {schedules.map((s) => (
          <div key={s.date} className="schedule-item">
            <span>{s.date} ({s.time})</span>
            <select
              value={answers[s.date] || ""}
              onChange={(e) => handleChange(s.date, e.target.value)}
            >
              <option value="">選択</option>
              <option value="◯">◯</option>
              <option value="✕">✕</option>
            </select>
          </div>
        ))}
        {schedules.length > 0 && (
          <button className="submit-btn" onClick={handleSubmit}>
            回答を送信
          </button>
        )}
      </div>
    </div>
  );
};

export default SharePage;
