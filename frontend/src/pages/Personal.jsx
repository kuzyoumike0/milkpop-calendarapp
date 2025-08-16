import React, { useEffect, useMemo, useState } from 'react';
import { addPersonal, listPersonal } from '../api';
import MiniCalendar from '../components/MiniCalendar.jsx';

export default function Personal() {
  const [me, setMe] = useState(null);
  const [user, setUser] = useState('');
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [timeSlot, setTimeSlot] = useState('全日');
  const [items, setItems] = useState([]);

  // calendar state
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1);

  // fetch login/me
  const fetchMe = async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        setMe(data);
        if (data.loggedIn && data.email) setUser(data.email);
      }
    } catch {}
  };

  const fetchData = async () => {
    const q = new URLSearchParams();
    if (user) q.set('user', user);
    const res = await fetch('/api/personal?' + q.toString());
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => { fetchMe(); }, []);
  useEffect(() => { fetchData(); }, [user]);

  const onSubmit = async (e) => {
    e.preventDefault();
    await addPersonal({ user: user || '(guest)', title, memo, date, time_slot: timeSlot });
    setTitle(''); setMemo(''); setTimeSlot('全日');
    fetchData();
  };

  const del = async (id) => {
    await fetch('/api/personal/' + id, { method: 'DELETE' });
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
      <h2>個人スケジュール（ユーザー単位 / カレンダー選択 / メモ対応）</h2>

      <div className="row" style={{alignItems:'center', marginBottom:12}}>
        <label style={{color:'#9aa0b4'}}>ユーザー:</label>
        <input className="input" placeholder="ユーザー（Googleログインで自動入力）" value={user}
               onChange={e=>setUser(e.target.value)} readOnly={me?.loggedIn && !!me?.email} />
        {me?.loggedIn ? <span className="badge badge--ok">ログイン中</span> : <span className="badge badge--warn">未ログイン</span>}
      </div>

      <div className="row" style={{alignItems:'flex-start'}}>
        <div style={{flex:'0 0 320px'}}>
          <MiniCalendar
            year={calYear}
            month={calMonth}
            value={date}
            onChange={setDate}
            onPrev={prevMonth}
            onNext={nextMonth}
          />
        </div>

        <form onSubmit={onSubmit} style={{flex:1}}>
          <div className="card" style={{marginTop:0}}>
            <div className="row" style={{marginBottom:10}}>
              <div style={{minWidth:160}}>
                <div style={{color:'#9aa0b4', fontSize:12, marginBottom:4}}>日付</div>
                <input className="input" value={date} onChange={e=>setDate(e.target.value)} />
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
              <button className="button" type="submit">追加</button>
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
