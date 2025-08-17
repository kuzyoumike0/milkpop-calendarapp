import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import CalendarPicker from "./CalendarPicker";

const HOLIDAYS = new Set([
  "2025-01-01","2025-01-13","2025-02-11","2025-03-20",
  "2025-04-29","2025-05-03","2025-05-04","2025-05-05","2025-05-06",
  "2025-07-21","2025-08-11","2025-09-15","2025-09-23",
  "2025-10-13","2025-11-03","2025-11-23","2025-11-24"
]);

function toDateKey(dstr){
  if (/^\d{4}-\d{2}-\d{2}$/.test(dstr)) return dstr;
  const d = new Date(dstr);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

export default function CalendarView(){
  const [events, setEvents] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCalendars = async ()=>{
    const res = await axios.get("/api/calendars");
    setCalendars(res.data || []);
    const defaultSel = (res.data || []).map(c => c.id);
    setSelected(defaultSel);
    await fetchEvents(defaultSel);
  };

  const fetchEvents = async (ids)=>{
    const params = (ids && ids.length) ? { params: { calendarIds: ids.join(',') } } : {};
    const res = await axios.get("/api/schedules", params);
    setEvents(res.data || []);
    setLoading(false);
  };

  useEffect(()=>{ fetchCalendars(); },[]);

  const grouped = useMemo(()=>{
    const map = new Map();
    (events||[]).forEach(e=>{
      const key = toDateKey(e.date);
      if(!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    });
    return Array.from(map.entries()).sort((a,b)=> a[0].localeCompare(b[0]));
  },[events]);

  const toggle = (id)=>{
    const next = selected.includes(id) ? selected.filter(x=>x!==id) : [...selected, id];
    setSelected(next);
    fetchEvents(next);
  };

  if(loading) return <div className="panel">読み込み中...</div>;

  return (
    <div className="grid">
      <section className="col-8">
        <div className="panel">
          {grouped.length === 0 && <div>表示対象のカレンダーに予定がありません。</div>}
          {grouped.map(([date, list])=>{
            const isHoliday = HOLIDAYS.has(date);
            return (
              <div className="card" key={date}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <div className="date">{date}</div>
                    {isHoliday && <span className="badge holiday">祝日</span>}
                  </div>
                  <div className="badges">
                    <span className="badge">件数: {list.length}</span>
                  </div>
                </div>
                <div style={{display:'grid', gap:10}}>
                  {list.map(ev=>{
                    const slot = (ev.timeslot||'').trim();
                    const slotClass = slot === '全日' ? 'all' : (slot === '昼' ? 'noon' : 'night');
                    const calColor = ev.calendar_color || "#60a5fa";
                    const calName = ev.calendar_name || "未分類";
                    return (
                      <div className="item" key={ev.id || ev.title + ev.date + slot}>
                        <div className="left">
                          <span className="dot" style={{background: calColor}}></span>
                          <div className="badges">
                            <span className={`badge ${slotClass}`}>{slot || '全日'}</span>
                          </div>
                          <div className="title">{ev.title}</div>
                        </div>
                        <div className="badges">
                          <span className="badge">{calName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>
      <aside className="col-4">
        <div className="panel">
          <div className="kicker">CALENDARS</div>
          <h3 style={{margin:'6px 0 12px'}}>表示するカレンダー</h3>
          <div style={{display:'grid', gap:8, marginBottom:12}}>
            {calendars.map(c => (
              <label key={c.id} style={{display:'flex', alignItems:'center', gap:10}}>
                <input type="checkbox" checked={selected.includes(c.id)} onChange={()=> toggle(c.id)} />
                <span className="dot" style={{background:c.color}}></span>
                <span>{c.name}</span>
              </label>
            ))}
          </div>
          <NewCalendar onCreated={(c)=> { setCalendars(prev=>[...prev, c]); setSelected(prev=>[...prev, c.id]); fetchEvents([...selected, c.id]) }} />
          <hr className="sep" />
          <div className="kicker">QUICK ADD</div>
          <h3 style={{margin:'6px 0 12px'}}>クイック追加</h3>
          <QuickAdd calendars={calendars} defaultCalendarId={selected[0] || (calendars[0] && calendars[0].id)} onAdded={(e)=> setEvents(prev => [...prev, e])} />
          <div className="note" style={{marginTop:10}}>※ 右のクイック追加の「カレンダー」で登録先を選べます。</div>
        </div>
      </aside>
    </div>
  )
}

function NewCalendar({ onCreated }){
  const [name,setName] = React.useState("");
  const [color,setColor] = React.useState("#60a5fa");
  const [saving,setSaving] = React.useState(false);

  const submit = async (e)=>{
    e.preventDefault();
    if(!name) return;
    setSaving(true);
    try{
      const res = await axios.post("/api/calendars", { name, color });
      onCreated && onCreated(res.data);
      setName(""); setColor("#60a5fa");
    }finally{ setSaving(false); }
  };

  return (
    <form className="form" onSubmit={submit} style={{marginBottom:12}}>
      <div className="kicker">NEW CALENDAR</div>
      <div className="field">
        <label>カレンダー名</label>
        <input type="text" placeholder="例) 個人／チームA" value={name} onChange={e=>setName(e.target.value)} />
      </div>
      <div className="field">
        <label>カラー</label>
        <input type="color" value={color} onChange={e=>setColor(e.target.value)} />
      </div>
      <div style={{display:'flex', gap:10}}>
        <button className="btn" type="submit" disabled={saving}>{saving ? "作成中..." : "作成"}</button>
        <button type="button" className="btn btn-secondary" onClick={()=>{setName(""); setColor("#60a5fa");}}>クリア</button>
      </div>
    </form>
  )
}




function QuickAdd({ onAdded, calendars, defaultCalendarId }){
  const [title,setTitle] = React.useState("");
  const [timeslot,setTimeslot] = React.useState("全日");
  const [calendarId,setCalendarId] = React.useState(defaultCalendarId || null);
  const [saving,setSaving] = React.useState(false);
  const [selected, setSelected] = React.useState(new Set());
  const [selectionMode, setSelectionMode] = React.useState('range'); // 'range' | 'multi'
  const [shareUrl, setShareUrl] = React.useState("");

  React.useEffect(()=>{ setCalendarId(defaultCalendarId || null); },[defaultCalendarId]);

  const submit = async (e)=>{
    e.preventDefault();
    if(!title || selected.size === 0) return;
    setSaving(true);
    try{
      const dates = Array.from(selected);
      const res = await axios.post("/api/schedules/bulk", { title, dates, timeslot, calendar_id: calendarId });
      onAdded && res.data && res.data.forEach(ev => onAdded(ev));
      setTitle(""); setSelected(new Set()); setTimeslot("全日");
    }finally{ setSaving(false); }
  };

  const createShare = async ()=>{
    const ids = calendars.filter(c=> c && c.id).map(c=> c.id);
    // Use currently checked calendars if available in parent state (selected list)
    try {
      const selIds = ids; // You can wire this to parent 'selected' if needed
      const resp = await axios.post("/api/share", { calendarIds: selIds });
      setShareUrl(resp.data.url);
      try{
        await navigator.clipboard.writeText(window.location.origin + resp.data.url);
      }catch{}
    } catch(e) {
      setShareUrl("発行に失敗しました");
    }
  };

  return (
    <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:14}}>
      <div>
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
      <div>
        <form className="form" onSubmit={submit}>
          <div className="field">
            <label>カレンダー</label>
            <select value={calendarId || ''} onChange={e=> setCalendarId(e.target.value ? parseInt(e.target.value,10) : null)}>
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
          <div style={{display:'flex', gap:10}}>
            <button className="btn" type="submit" disabled={saving}>{saving ? "保存中..." : "追加"}</button>
            <button className="btn btn-secondary" type="button" onClick={()=>{setTitle(''); setSelected(new Set()); setTimeslot('全日')}}>クリア</button>
          </div>
          <hr className="sep" />
          <div className="field">
            <label>共有リンク</label>
            <div style={{display:'flex', gap:10}}>
              <button type="button" className="btn btn-secondary" onClick={createShare}>共有リンクを発行</button>
              {shareUrl && <input type="text" readOnly value={shareUrl.startsWith('http')? shareUrl : (typeof window !== 'undefined' ? window.location.origin + shareUrl : shareUrl)} />}
            </div>
            <div className="note">選択中のカレンダー一覧の共有リンクを毎回新規発行します。</div>
          </div>
        </form>
      </div>
    </div>
  )
}
