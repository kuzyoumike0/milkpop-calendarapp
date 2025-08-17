
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CalendarPicker from "./CalendarPicker";

export default function EventForm(){
  const [title,setTitle] = useState("");
  const [timeslot,setTimeslot] = useState("全日");
  const [calendars,setCalendars] = useState([]);
  const [calendarId,setCalendarId] = useState(null);
  const [selected,setSelected] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState('range'); // 'range' | 'multi'
  const navigate = useNavigate();
  const [saving,setSaving] = useState(false);

  useEffect(()=>{
    axios.get("/api/calendars").then(res=>{
      const arr = res.data || [];
      setCalendars(arr);
      if(arr[0]) setCalendarId(arr[0].id);
    });
  },[]);

  const submit = async (e)=>{
    e.preventDefault();
    if(!title || selected.size === 0) return;
    setSaving(true);
    try{
      const dates = Array.from(selected);
      await axios.post("/api/schedules/bulk", { title, dates, timeslot, calendar_id: calendarId });
      navigate("/calendar");
    }finally{ setSaving(false); }
  };

  return (
    <div className="grid">
      <section className="col-8">
        <div className="panel">
          <div className="kicker">SELECT DATES</div>
          <h2 style={{marginTop:6}}>日付選択</h2>
          <div className="field">
            <label>日付の選択方法</label>
            <div style={{display:'flex', gap:12}}>
              <label><input type="radio" name="selmode" value="range" checked={selectionMode==='range'} onChange={()=>setSelectionMode('range')} /> 範囲選択</label>
              <label><input type="radio" name="selmode" value="multi" checked={selectionMode==='multi'} onChange={()=>setSelectionMode('multi')} /> 複数選択</label>
            </div>
          </div>
          <div className="field">
            <label>日付（{selectionMode==='range' ? '範囲' : '複数'}選択可）</label>
            <CalendarPicker
              value={selected}
              onChange={setSelected}
              highlightColor={(calendars.find(c=>c.id===calendarId)?.color) || "#22d3ee"}
              mode={selectionMode}
              size="sm"
            />
          </div>
        </div>
      </section>
      <aside className="col-4">
        <div className="panel">
          <div className="kicker">NEW EVENT</div>
          <h2 style={{marginTop:6}}>予定を追加</h2>
          <form className="form" onSubmit={submit}>
            <div className="field">
              <label>カレンダー</label>
              <select value={calendarId || ''} onChange={e=> setCalendarId(parseInt(e.target.value,10))}>
                {calendars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
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
            <div className="note">左のカレンダーで選択した複数日へ一括登録されます。</div>
            <div style={{display:'flex', gap:10}}>
              <button className="btn" type="submit" disabled={saving}>{saving ? "保存中..." : "保存"}</button>
              <button className="btn btn-secondary" type="button" onClick={()=> navigate(-1)}>戻る</button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  )
}
