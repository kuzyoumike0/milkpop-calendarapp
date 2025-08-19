import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({});

  useEffect(() => {
    axios.get(`/api/schedule/${id}`).then(res => setSchedule(res.data));
  }, [id]);

  const save = async () => {
    await axios.post(`/api/schedule/${id}/respond`, { username, responses });
    const res = await axios.get(`/api/schedule/${id}`);
    setSchedule(res.data);
  };

  if (!schedule) return <p>読み込み中...</p>;

  return (
    <div>
      <h2>共有日程: {schedule.title}</h2>
      <input placeholder="名前" value={username} onChange={e=>setUsername(e.target.value)} /><br/>
      {schedule.dates?.map((d,i)=>(
        <div key={i}>
          {d}:
          <select value={responses[d] || ""} onChange={e=>setResponses({...responses, [d]: e.target.value})}>
            <option value="">未選択</option>
            <option value="◯">◯</option>
            <option value="✖">✖</option>
          </select>
        </div>
      ))}
      <button onClick={save}>保存</button>

      <h3>回答一覧</h3>
      {schedule.responses?.map((r,i)=>(
        <div key={i}>
          {r.username}: {Object.entries(r.responses).map(([d,v])=>`${d}:${v}`).join(", ")}
        </div>
      ))}
    </div>
  );
}
