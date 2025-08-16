import React, { useEffect, useMemo, useState } from 'react';
import UniversalCalendar from '../components/UniversalCalendar.jsx';

function addDays(iso, n){
  const dt = new Date(iso + 'T00:00:00');
  dt.setDate(dt.getDate() + n);
  const y = dt.getFullYear();
  const m = String(dt.getMonth()+1).padStart(2,'0');
  const d = String(dt.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
const rangeDates = (start, end) => {
  const s = start;
  const e = end || start;
  const out = [];
  let cur = s;
  while (cur <= e) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
};

export default function Shared() {
  const [items, setItems] = useState([]);
  const [lastShareURL, setLastShareURL] = useState('');

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const todayIso = new Date().toISOString().slice(0,10);
  const [range, setRange] = useState({ start: todayIso, end: todayIso });

  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');

  const fetchShared = async () => {
    const r = await fetch('/api/shared'); const d = await r.json(); setItems(d);
  };
  useEffect(()=>{ fetchShared(); }, []);

  const addShared = async (e) => {
    e.preventDefault();
    const dates = rangeDates(range.start, range.end);
    let lastUrl = '';
    for (const date of dates) {
      const res = await fetch('/api/shared', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ title, date, time_slot: timeSlot })
      });
      if (!res.ok) {
        alert('追加に失敗しました');
        return;
      }
      const out = await res.json();
      lastUrl = out.item?.share_url || lastUrl;
    }
    setTitle(''); setTimeSlot('全日');
    setLastShareURL(lastUrl);
    fetchShared();
  };
  const del = async (id) => {
    const r = await fetch('/api/shared/' + id, { method:'DELETE' });
    if (r.ok) fetchShared();
  };

  const prevMonth = () => { const m = month - 1; if (m < 1) { setMonth(12); setYear(year-1); } else setMonth(m); };
  const nextMonth = () => { const m = month + 1; if (m > 12) { setMonth(1); setYear(year+1); } else setMonth(m); };

  const monthKey = `${year}-${String(month).padStart(2,'0')}`;
  const eventsByDay = useMemo(() => {
    const map = {};
    for (const ev of items) {
      (map[ev.date] ||= []).push(ev);
    }
    return map;
  }, [items]);

  const renderDay = (iso) => {
    if (!iso) return '';
    const day = Number(iso.slice(-2));
    const list = eventsByDay[iso] || [];
    return (
      <div style={{display:'grid', gridTemplateRows:'auto auto', placeItems:'center', gap:4}}>
        <div style={{fontWeight:700}}>{day}</div>
        <div style={{display:'inline-flex', gap:4}}>
          {list.slice(0,3).map((ev, i) => (
            <span
              key={ev.id || i}
              title={`${ev.title} [${ev.time_slot}]`}
              style={{ width:8, height:8, borderRadius:'50%',
                       background: ev.time_slot === '全日' ? '#22d3ee' : ev.time_slot === '昼' ? '#34d399' : '#f472b6',
                       boxShadow:'0 0 0 2px rgba(255,255,255,.15)' }}
            />
          ))}
          {list.length > 3 ? <span style={{fontSize:10, opacity:.8}}>+{list.length-3}</span> : null}
        </div>
      </div>
    );
  };

  const copy = async (text) => {
    try{ await navigator.clipboard.writeText(text); alert('リンクをコピーしました'); }
    catch{ prompt('コピーしてください', text); }
  };

  return (
    <section className="card">
      <h2>共有スケジュール（範囲選択対応 + 自作カレンダー + 個別リンク発行）</h2>

      <div className="row" style={{alignItems:'flex-start'}}>
        <div style={{flex:'0 0 420px'}}>
          <UniversalCalendar
            mode="range"
            year={year}
            month={month}
            range={range}
            onRangeChange={setRange}
            onPrev={prevMonth}
            onNext={nextMonth}
            renderDay={renderDay}
          />
          <div className="row" style={{marginTop:8}}>
            <button className="button ghost" onClick={()=>{
              const t = new Date();
              setYear(t.getFullYear()); setMonth(t.getMonth()+1);
              const iso = t.toISOString().slice(0,10);
              setRange({ start: iso, end: iso });
            }}>今日へ</button>
            <button className="button ghost" onClick={()=> setRange(r => ({ start: r.start, end: null }))}>単日に戻す</button>
          </div>
        </div>

        <div style={{flex:1}}>
          <div className="card" style={{marginTop:0}}>
            <div style={{color:'#9aa0b4', fontSize:12, marginBottom:6}}>選択範囲</div>
            <input className="input" readOnly
              value={range.end ? `${range.start} 〜 ${range.end}` : range.start}
              style={{marginBottom:10, width:'100%'}} />

            <form onSubmit={addShared}>
              <div className="row" style={{marginBottom:10}}>
                <input className="input" placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)} required style={{flex:1}} />
                <select className="select" value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}>
                  <option>全日</option><option>昼</option><option>夜</option>
                </select>
                <button className="button" type="submit">範囲分 追加 & リンク発行</button>
              </div>
            </form>

            {lastShareURL && (
              <div className="card" style={{marginTop:8}}>
                <div style={{color:'#9aa0b4', fontSize:12, marginBottom:6}}>直近で発行したリンク</div>
                <div className="row">
                  <input className="input" readOnly value={lastShareURL} style={{flex:1}} />
                  <button className="button" onClick={()=>copy(lastShareURL)}>コピー</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
