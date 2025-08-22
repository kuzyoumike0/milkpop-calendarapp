import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function SharePage() {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("参加");

  useEffect(() => {
    fetch(`/api/schedules/${id}`)
      .then(res => res.json())
      .then(data => setSchedule(data));
  }, [id]);

  const handleSubmit = async () => {
    const res = await fetch(`/api/schedules/${id}/attend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, status })
    });
    const data = await res.json();
    setSchedule(prev => ({ ...prev, participants: data.participants }));
  };

  if (!schedule) return <p>読み込み中...</p>;

  return (
    <div className="page-container">
      <h2 className="page-title">共有された日程</h2>
      <ul>
        {schedule.schedules.map((s, idx) => (
          <li key={idx}>
            {s.date} - {s.time}
          </li>
        ))}
      </ul>

      <h3>出欠登録</h3>
      <input
        type="text"
        placeholder="名前を入力"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="参加">参加</option>
        <option value="不参加">不参加</option>
        <option value="未定">未定</option>
      </select>
      <button onClick={handleSubmit}>登録</button>

      <h3>参加者一覧</h3>
      <ul>
        {schedule.participants?.map((p, idx) => (
          <li key={idx}>{p.name}：{p.status}</li>
        ))}
      </ul>
    </div>
  );
}

export default SharePage;
