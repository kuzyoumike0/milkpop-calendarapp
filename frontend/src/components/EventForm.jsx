
import React, { useEffect, useState } from "react";
import axios from "axios";
import CalendarPicker from "./CalendarPicker";

export default function EventForm(){
  const [title,setTitle] = useState("");
  const [mode,setMode] = useState("allday"); // 'allday'|'noon'|'night'
  const [calendars,setCalendars] = useState([]);
  const [calendarId,setCalendarId] = useState(null);
  const [selected,setSelected] = useState(new Set());
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
      return { date:d, title, timeslot:'全日', calendar_id: calendarId };
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
          <h2 style={{marginTop:6}}>日付選択（ドラッグで範囲選択）</h2>
          <div className="field">
            <label>日付</label>
            <CalendarPicker
              value={selected}
              onChange={setSelected}
              highlightColor={(calendars.find(c=>c.id===calendarId)?.color) || "#22d3ee"}
              mode="range"
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
              <select value={mode} onChange={e=> setMode(e.target.value)}>
                <option value="allday">終日</option>
                <option value="noon">昼</option>
                <option value="night">夜</option>
              </select>
            </div>
            <div className="note">保存せず、選択内容から毎回<strong>新しい共有リンク</strong>を発行します。</div>
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
