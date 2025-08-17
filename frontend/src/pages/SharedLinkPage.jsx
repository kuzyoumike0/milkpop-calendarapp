import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharedLinkPage() {
  const { shareId } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [username, setUsername] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(()=>{
    axios.get(`/api/shared/${shareId}`).then(res=>setSchedule(res.data));
  }, [shareId]);

  const handleRegister = async () => {
    await axios.post(`/api/shared/${shareId}/register`, { username, memo });
    alert("登録しました！");
  };

  if(!schedule) return <p>読み込み中...</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-primary">{schedule.title}</h2>
      <p>日付: {schedule.event_date}</p>
      <p>時間: {schedule.time_range}</p>
      <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="名前" className="block mb-2 px-2 py-1 rounded text-black"/>
      <textarea value={memo} onChange={e=>setMemo(e.target.value)} placeholder="メモ" className="block mb-2 px-2 py-1 rounded text-black"/>
      <button onClick={handleRegister} className="px-4 py-2 bg-primary text-dark rounded-lg hover:bg-secondary hover:text-white">登録</button>
    </div>
  );
}
