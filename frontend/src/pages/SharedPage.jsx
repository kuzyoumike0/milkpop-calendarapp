import React, { useState } from "react";
import axios from "axios";

export default function SharedPage() {
  const [shareId, setShareId] = useState(null);
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  const [note, setNote] = useState("");

  const createLink = async () => {
    const res = await axios.post("/api/shared/new");
    setShareId(res.data.shareId);
  };

  const saveEvent = async () => {
    if (!shareId) return;
    await axios.post(`/api/shared/${shareId}`, {
      title,
      username,
      start_time: start,
      end_time: end,
      note
    });
    alert("登録しました");
  };

  return (
    <div style={{padding:"20px"}}>
      <h2>共有スケジュール</h2>
      <div>
        <button onClick={createLink}>共有リンクを発行</button>
        {shareId && <p>リンク: http://localhost:8080/shared/{shareId}</p>}
      </div>
      <div style={{marginTop:"20px"}}>
        <input placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)} /><br/>
        <input placeholder="ユーザー名" value={username} onChange={e=>setUsername(e.target.value)} /><br/>
        <label>開始時間: <input type="time" value={start} onChange={e=>setStart(e.target.value)} /></label><br/>
        <label>終了時間: <input type="time" value={end} onChange={e=>setEnd(e.target.value)} /></label><br/>
        <textarea placeholder="メモ" value={note} onChange={e=>setNote(e.target.value)} /><br/>
        <button onClick={saveEvent}>登録</button>
      </div>
    </div>
  );
}
