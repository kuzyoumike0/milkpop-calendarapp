import React, { useEffect, useState } from 'react';
import { listShared, addShared } from '../api';

export default function Shared({ embedUrl }) {
  const [items, setItems] = useState([]);
  const [gEvents, setGEvents] = useState([]);
  const [summary, setSummary] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [createdBy, setCreatedBy] = useState('');

  const fetchShared = async () => {
    const res = await fetch('/api/shared');
    const data = await res.json();
    setItems(data);
  };

  const fetchGoogle = async () => {
    const params = new URLSearchParams();
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7*24*3600*1000);
    params.set('timeMin', now.toISOString());
    params.set('timeMax', weekLater.toISOString());
    const res = await fetch('/api/google/calendar/list?' + params.toString());
    if (res.ok) {
      const data = await res.json();
      setGEvents(data.items || []);
    }
  };

  useEffect(() => {
    fetchShared();
    fetchGoogle();
  }, []);

  const submitShared = async (e) => {
    e.preventDefault();
    await addShared({ title: summary, date, time_slot: timeSlot, created_by: createdBy });
    setSummary(''); setDate(''); setTimeSlot('全日'); setCreatedBy('');
    fetchShared();
  };

  const addGoogleEvent = async (e) => {
    e.preventDefault();
    const start = date + (timeSlot === '全日' ? 'T00:00:00' : timeSlot === '昼' ? 'T12:00:00' : 'T19:00:00');
    const end = date + (timeSlot === '全日' ? 'T23:59:59' : timeSlot === '昼' ? 'T13:00:00' : 'T21:00:00');
    const res = await fetch('/api/google/calendar/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary, startISO: start, endISO: end })
    });
    if (res.ok) { setSummary(''); setDate(''); setTimeSlot('全日'); fetchGoogle(); }
    else { alert('Googleカレンダー追加に失敗しました'); }
  };

  const deleteGoogleEvent = async (id) => {
    const res = await fetch('/api/google/calendar/event/' + encodeURIComponent(id), { method: 'DELETE' });
    if (res.ok) fetchGoogle();
  };

  return (
    <section className="card">
      <h2>共有スケジュール（Googleカレンダー連携）</h2>
      {embedUrl ? (
        <div style={{marginBottom:16}}>
          <iframe title="Google Calendar" src="https://calendar.google.com/calendar/embed?src=c5b59382c5570230f3a7a58e12c047a1c5c16d271722f5c094bcd01046d6606d%40group.calendar.google.com&ctz=Asia%2FTokyo" style={{border:0, width:'100%', height:'600px', borderRadius:'12px'}} frameBorder="0" scrolling="no" />
        </div>
      ) : (
      )}

      <div className="row" style={{alignItems:'center', marginTop:12}}>
        <input className="input" placeholder="タイトル" value={summary} onChange={e=>setSummary(e.target.value)} />
        <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <select className="select" value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}>
          <option>全日</option><option>昼</option><option>夜</option>
        </select>
        <input className="input" placeholder="作成者（共有DB側）" value={createdBy} onChange={e=>setCreatedBy(e.target.value)} />
        <button className="button" onClick={submitShared}>共有DBに追加</button>
        <button className="button" onClick={addGoogleEvent}>Googleに追加</button>
      </div>

      <h3 style={{marginTop:16}}>Googleカレンダー（直近1週間）</h3>
      <ul className="list">
        {gEvents.map(ev => (
          <li key={ev.id} className="item">
            {ev.summary || '(無題)'}：
            {ev.start?.dateTime || ev.start?.date} → {ev.end?.dateTime || ev.end?.date}
            <button className="button" style={{marginLeft:12}} onClick={()=>deleteGoogleEvent(ev.id)}>削除</button>
          </li>
        ))}
      </ul>

      <h3 style={{marginTop:16}}>共有DBの予定（個人含む）</h3>
      <ul className="list">
        {items.map(it => (
          <li key={it.id} className="item">
            {it.date} [{it.time_slot}] {it.title} <span className="tag">{it.created_by}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
