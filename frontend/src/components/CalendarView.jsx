import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

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
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    axios.get("/api/schedules").then((res)=>{
      setEvents(res.data || []);
    }).finally(()=> setLoading(false));
  },[]);

  const grouped = useMemo(()=>{
    const map = new Map();
    (events||[]).forEach(e=>{
      const key = toDateKey(e.date);
      if(!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    });
    return Array.from(map.entries()).sort((a,b)=> a[0].localeCompare(b[0]));
  },[events]);

  if(loading) return <div className="panel">読み込み中...</div>;

  return (
    <div className="grid">
      <section className="col-8">
        <div className="panel">
          {grouped.length === 0 && <div>まだ予定がありません。右上の「新規予定」から追加してください。</div>}
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
                    return (
                      <div className="item" key={ev.id || ev.title + ev.date + slot}>
                        <div className="left">
                          <div className="badges">
                            <span className={`badge ${slotClass}`}>{slot || '全日'}</span>
                          </div>
                          <div className="title">{ev.title}</div>
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
          <div className="kicker">QUICK ADD</div>
          <h3 style={{margin:'6px 0 12px'}}>クイック追加</h3>
          <QuickAdd onAdded={(e)=> setEvents(prev => [...prev, e])} />
          <hr className="sep" />
          <div className="note">※ サイドフォームは簡易版です。詳細入力は上部メニュー「予定追加」から。</div>
        </div>
      </aside>
    </div>
  )
}

function QuickAdd({ onAdded }){
  const [date,setDate] = React.useState("");
  const [title,setTitle] = React.useState("");
  const [timeslot,setTimeslot] = React.useState("全日");
  const [saving,setSaving] = React.useState(false);

  const submit = async (e)=>{
    e.preventDefault();
    if(!title || !date) return;
    setSaving(true);
    try{
      const res = await axios.post("/api/schedules", { title, date, timeslot });
      onAdded && onAdded(res.data);
      setTitle(""); setDate(""); setTimeslot("全日");
    }finally{
      setSaving(false);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <div className="field">
        <label>日付</label>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
      </div>
      <div className="field">
        <label>予定</label>
        <input type="text" placeholder="例) チームMTG" value={title} onChange={e=>setTitle(e.target.value)} />
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
        <button className="btn btn-secondary" type="reset" onClick={()=>{setTitle(""); setDate(""); setTimeslot("全日")}}>クリア</button>
      </div>
    </form>
  )
}