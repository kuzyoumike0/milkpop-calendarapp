import React, { useEffect, useMemo, useState } from 'react';
import UniversalCalendar from '../components/UniversalCalendar.jsx';
import Modal from '../components/Modal.jsx';
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
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1);
  const todayIso = new Date().toISOString().slice(0,10);
  const [range, setRange] = useState({ start: todayIso, end: todayIso });

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailDate, setDetailDate] = useState(todayIso);

  const fetchData = async () => {
    const r = await fetch('/api/personal'); const d = await r.json(); setItems(d);
  };
  useEffect(()=>{ fetchData(); }, []);

  const eventsByDay = useMemo(() => {
    const map = {};
    for (const ev of items) {
      (map[ev.date] ||= []).push(ev);
    }
    return map;
  }, [items]);

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

  const openDetail = (iso) => {
    setDetailDate(iso);
    setDetailOpen(true);
  };

  const renderDay = (iso) => {
    if(!iso) return '';
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
    )
  };

  return (
    <section className="card">
      <h2>個人スケジュール（範囲選択 / メモ・日付クリックで詳細）</h2>

      <div className="row" style={{alignItems:'flex-start'}}>
        <div style={{flex:'0 0 420px'}}>
          <UniversalCalendar
            mode="range"
            year={calYear}
            month={calMonth}
            range={range}
            onRangeChange={setRange}
            onPrev={prevMonth}
            onNext={nextMonth}
            onDayClick={openDetail}   // ★ クリックで詳細表示
            renderDay={renderDay}     // ★ カレンダ内に予定マーカー
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

      <h3 style={{marginTop:16}}>あなたの予定（一覧）</h3>
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

      {/* 詳細モーダル */}
      <Modal open={detailOpen} title={`${detailDate} の予定`} onClose={()=>setDetailOpen(false)}>
        <ul className="list">
          {(eventsByDay[detailDate] || []).map(ev => (
            <li key={ev.id} className="item" style={{border:'none', paddingLeft:0}}>
              <span className="tag">{ev.time_slot}</span>
              <span style={{marginLeft:8, fontWeight:600}}>{ev.title}</span>
              {ev.memo ? <em style={{marginLeft:8, color:'#9aa0b4'}}>— {ev.memo}</em> : null}
              <button className="button" style={{marginLeft:'auto'}} onClick={()=>del(ev.id)}>削除</button>
            </li>
          ))}
          {(eventsByDay[detailDate] || []).length === 0 && (
            <li className="item" style={{border:'none', color:'#9aa0b4'}}>この日には予定がありません</li>
          )}
        </ul>
      </Modal>
    </section>
  );
}
