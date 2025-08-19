import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({});

  useEffect(() => {
    axios.get(`/api/share/${linkid}`).then(res => setSchedules(res.data));
  }, [linkid]);

  const handleSave = async (id) => {
    await axios.post("/api/response", {
      schedule_id: id,
      username,
      response: responses[id] || "✖"
    });
    alert("保存しました");
  };

  return (
    <div>
      <h2 className="text-2xl">共有スケジュール</h2>
      <input className="text-black p-2" placeholder="名前を入力" value={username} onChange={e=>setUsername(e.target.value)} />
      {schedules.map(s => (
        <div key={s.id} className="border p-2 my-2">
          <div>{s.title} ({s.start_date}~{s.end_date}) [{s.timeslot}]</div>
          <select className="text-black p-1" value={responses[s.id]||""} onChange={e=>setResponses({...responses, [s.id]: e.target.value})}>
            <option value="">選択</option>
            <option value="〇">〇</option>
            <option value="✖">✖</option>
          </select>
          <button onClick={()=>handleSave(s.id)} className="ml-2 bg-[#004CA0] px-2 py-1 rounded">保存</button>
        </div>
      ))}
    </div>
  );
}
