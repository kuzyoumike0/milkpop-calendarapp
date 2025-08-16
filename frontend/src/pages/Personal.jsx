import React, { useEffect, useState } from 'react';
import UniversalCalendar from '../components/UniversalCalendar.jsx';
import { addPersonal } from '../api.js';

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

export default function Personal() {
  const [me, setMe] = useState(null);
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1);
  const todayIso = new Date().toISOString().slice(0,10);
  const [range, setRange] = useState({ start: todayIso, end: todayIso });

  const fetchMe = async () => {
    const r = await fetch('/api/me'); const d = await r.json(); setMe(d);
  };
  const fetchData = async () => {
    const r = await fetch('/api/personal'); const d = await r.json(); setItems(d);
  };
  useEffect(()=>{ fetchMe(); fetchData(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const ds = rangeDates(range.start, range.end);
    for (const d of ds) {
      await addPersonal({ title, memo, date: d, time_slot: timeSlot });
    }
    setTitle(''); setMemo(''); setTimeSlot('全日');
    fetchData();
  };

  const del = async (id) => {
    await fetch('/api/personal/' + id, { method:'DELETE' });
    fetchData();
  };

  const prevMonth = () => {
    const m = calMonth - 1;
    if (m < 1) { setCalMonth(12); setCalYear(calYear - 1); }
    else setCalMonth(m);
  };
  const nextMonth = () => {
    const m = calMonth + 1;
    if (m > 12) { setCalMonth(1); setCalYear(calYear + 1); }
    else setCalMonth(m);
  };

  return (
    <section className="card">
      <h2>個人スケジュール（範囲選択 / メモ）</h2>

      <div className="row" style={{alignItems:'flex-start'}}>
        <div style={{flex:'0 0 360px'}}>
          <UniversalCalendar
            mode="range"
            year={calYear}
            month={calMonth}
            range={range}
            onRangeChange={setRange}
            onPrev={prevMonth}
            onNext={nextMonth}
          />
          <div className="row" style={{marginTop:8}}>
            <button className="button ghost" onClick={()=> setRange({ start: todayIso, end: todayIso })}>今日に戻る</button>
            <button className="button ghost" onClick={()=> setRange(r => ({ start: r.start, end: null }))}>単日指定に戻す</button>
          </div>
        </div>

        <form onSubmit={onSubmit} style={{flex:1}}>
          <div className="card" style={{marginTop:0}}>
            <div className="row" style={{marginBottom:10}}>
              <div style={{minWidth:220}}>
                <div style={{color:'#9aa0b4', fontSize:12, marginBottom:4}}>選択範囲</div>
                <input className="input" readOnly value={range.end ? `${range.start} 〜 ${range.end}` : range.start} />
              </div>
              <div style={{minWidth:260, flex:1}}>
                <div style={{color:'#9aa0b4', fontSize:12, marginBottom:4}}>タイトル</div>
                <input className="input" placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)} required />
              </div>
            </div>

            <div style={{marginBottom:10}}>
              <div style={{color:'#9aa0b4', fontSize:12, marginBottom:6}}>時間帯（全日 / 昼 / 夜）</div>
              <div className="row">
                {['全日','昼','夜'].map(s => (
                  <button key={s} type="button"
                          className="button"
                          onClick={()=>setTimeSlot(s)}
                          style={{background: timeSlot===s ? 'linear-gradient(90deg, var(--brand), var(--brand2))' : 'rgba(255,255,255,.04)',
                                  color: timeSlot===s ? '#0f1020' : 'var(--txt)',
                                  border: '1px solid var(--border)'}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:12}}>
              <div style={{color:'#9aa0b4', fontSize:12, marginBottom:4}}>メモ</div>
              <textarea className="input" rows={4} placeholder="補足・持ち物・URLなど"
                        value={memo} onChange={e=>setMemo(e.target.value)}
                        style={{width:'100%', resize:'vertical'}} />
            </div>

            <div className="row">
              <button className="button" type="submit">
                {range.end && range.start !== range.end ? '範囲分を一括追加' : '追加'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <h3 style={{marginTop:16}}>あなたの予定</h3>
      <ul className="list">
        {items.map(it => (
          <li key={it.id} className="item">
            <strong>{it.date}</strong> [{it.time_slot}] {it.title}
            {it.memo ? <em style={{marginLeft:8, color:'#9aa0b4'}}>— {it.memo}</em> : null}
            <span className="tag">{it.user}</span>
            <button className="button" style={{marginLeft:'auto'}} onClick={()=>del(it.id)}>削除</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
