import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function EventForm(){
  const [title,setTitle] = useState("");
  const [date,setDate] = useState("");
  const [timeslot,setTimeslot] = useState("全日");
  const navigate = useNavigate();
  const [saving,setSaving] = useState(false);

  const submit = async (e)=>{
    e.preventDefault();
    if(!title || !date) return;
    setSaving(true);
    try{
      await axios.post("/api/schedules", { title, date, timeslot });
      navigate("/");
    }finally{
      setSaving(false);
    }
  };

  return (
    <div className="panel">
      <div className="kicker">NEW EVENT</div>
      <h2 style={{marginTop:6}}>予定を追加</h2>
      <form className="form" onSubmit={submit}>
        <div className="field">
          <label>日付</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        </div>
        <div className="field">
          <label>予定名</label>
          <input type="text" placeholder="例) 開発ミーティング" value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>区分</label>
          <select value={timeslot} onChange={e=>setTimeslot(e.target.value)}>
            <option>全日</option>
            <option>昼</option>
            <option>夜</option>
          </select>
        </div>
        <div style={{display:'flex', gap:10}}>
          <button className="btn" type="submit" disabled={saving}>{saving ? "保存中..." : "保存"}</button>
          <button className="btn btn-secondary" type="button" onClick={()=> navigate(-1)}>戻る</button>
        </div>
      </form>
    </div>
  )
}