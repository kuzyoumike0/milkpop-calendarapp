
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CalendarPicker from "./CalendarPicker";

const HOURS = Array.from({length: 24}, (_,i)=> String((i+1)%24).padStart(2,'0') + ':00'); // 01:00..00:00

export default function EventForm(){
  const [title,setTitle] = useState("");
  const [mode,setMode] = useState("allday"); // 'allday'|'noon'|'night'|'time'
  const [start,setStart] = useState("09:00");
  const [end,setEnd] = useState("18:00");
  const [calendars,setCalendars] = useState([]);
  const [calendarId,setCalendarId] = useState(null);
  const [selected,setSelected] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState('range');
  const [shareUrl, setShareUrl] = useState("");

  useEffect(()=>{
    axios.get("/api/calendars").then(res=>{
      const arr = res.data || [];
      setCalendars(arr);
      if(arr[0]) setCalendarId(arr[0].id);
    });
  },[]);

  const share = async (e)=>{
    e.preventDefault();
    if(!title || selected.size === 0 || !calendarId) return;
    const dates = Array.from(selected);
    const items = dates.map(d => {
      if (mode === 'allday') return { date:d, title, timeslot:'全日', calendar_id: calendarId };
      if (mode === 'noon') return { date:d, title, timeslot:'昼', calendar_id: calendarId };
      if (mode === 'night') return { date:d, title, timeslot:'夜', calendar_id: calendarId };
      return { date:d, title, timeslot:'時間', start_time:start, end_time:end, calendar_id: calendarId };
    });
    const resp = await axios.post('/api/share-items', { items, default_calendar_id: calendarId });
    setShareUrl(resp.data.url);
    try { await navigator.clipboard.writeText(window.location.origin + resp.data.url); } catch {}
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
              variant="card"
            />
          </div>
        </div>
      </section>
      <aside className="col-4">
        <div className="panel">
          <div className="kicker">SHARE</div>
          <h2 style={{marginTop:6}}>共有リンクを発行</h2>
          <form className="form" onSubmit={share}>
            <div className="field">
              <label>名前</label>
              <input type="text" placeholder="例) 開発ミーティング / 田中" value={title} onChange={e=>setTitle(e.target.value)} />
            </div>
            <div className="field">
              <label>区分</label>
              <div style={{display:'grid', gap:6}}>
                <label><input type="radio" name="mode" checked={mode==='allday'} onChange={()=> setMode('allday')} /> 終日</label>
                <label><input type="radio" name="mode" checked={mode==='noon'} onChange={()=> setMode('noon')} /> 昼</label>
                <label><input type="radio" name="mode" checked={mode==='night'} onChange={()=> setMode('night')} /> 夜</label>
                <label style={{display:'flex', alignItems:'center', gap:8}}>
                  <input type="radio" name="mode" checked={mode==='time'} onChange={()=> setMode('time')} /> 
                  時間指定：
                  <select value={start} onChange={e=> setStart(e.target.value)}>
                    {HOURS.map(h => <option key={'s'+h} value={h}>{h}</option>)}
                  </select>
                  〜
                  <select value={end} onChange={e=> setEnd(e.target.value)}>
                    {HOURS.map(h => <option key={'e'+h} value={h}>{h}</option>)}
                  </select>
                </label>
              </div>
            </div>
            <div className="note">保存せず、選択内容から毎回**新しい共有リンク**を発行します。</div>
            <div style={{display:'flex', gap:10}}>
              <button className="btn" type="submit">共有リンクを発行</button>
              <button className="btn btn-secondary" type="button" onClick={()=> { setTitle(''); setSelected(new Set()); }}>クリア</button>
            </div>
            {shareUrl && <input type="text" readOnly value={typeof window !== 'undefined' ? (window.location.origin + shareUrl) : shareUrl} style={{marginTop:8}} />}
          </form>
        </div>
      </aside>
    </div>
  )
}
