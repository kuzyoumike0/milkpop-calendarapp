import React, { useEffect, useState } from 'react';
import { listShared, addShared } from '../api';

/**
 * 共有スケジュール + Google Calendar 連携
 * - Google カレンダーの一覧を取得し、選択した calendarId でリスト/作成/削除
 * - 埋め込みURLは選択カレンダーに合わせて動的に生成（公開設定が必要）
 */
export default function Shared({ embedUrl }) {
  const [items, setItems] = useState([]);

  // Google calendars / events
  const [calendars, setCalendars] = useState([]);
  const [selectedCal, setSelectedCal] = useState('primary');
  const [gEvents, setGEvents] = useState([]);

  // Add forms
  const [summary, setSummary] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [createdBy, setCreatedBy] = useState('');

  const fetchShared = async () => {
    const res = await fetch('/api/shared');
    const data = await res.json();
    setItems(data);
  };

  const fetchCalendars = async () => {
    const res = await fetch('/api/google/calendars');
    if (res.ok) {
      const data = await res.json();
      const list = (data.items || []).sort((a,b) => (b.primary?1:0) - (a.primary?1:0));
      setCalendars(list);
      // default to primary if exists
      const primary = list.find(c => c.primary);
      setSelectedCal(primary ? primary.id : (list[0]?.id || 'primary'));
    }
  };

  const fetchGoogle = async (calendarId) => {
    const params = new URLSearchParams();
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7*24*3600*1000);
    params.set('timeMin', now.toISOString());
    params.set('timeMax', weekLater.toISOString());
    if (calendarId) params.set('calendarId', calendarId);
    const res = await fetch('/api/google/calendar/list?' + params.toString());
    if (res.ok) {
      const data = await res.json();
      setGEvents(data.items || []);
    } else {
      setGEvents([]);
    }
  };

  useEffect(() => {
    fetchShared();
    fetchCalendars().then(()=>{
      // events will be loaded in effect below when selectedCal changes
    });
  }, []);

  useEffect(() => {
    if (selectedCal) fetchGoogle(selectedCal);
  }, [selectedCal]);

  const submitShared = async (e) => {
    e.preventDefault();
    await addShared({ title: summary, date, time_slot: timeSlot, created_by: createdBy });
    setSummary(''); setDate(''); setTimeSlot('全日'); setCreatedBy('');
    fetchShared();
  };

  const addGoogleEvent = async (e) => {
    e.preventDefault();
    if (!selectedCal) return;
    const start = date + (timeSlot === '全日' ? 'T00:00:00' : timeSlot === '昼' ? 'T12:00:00' : 'T19:00:00');
    const end = date + (timeSlot === '全日' ? 'T23:59:59' : timeSlot === '昼' ? 'T13:00:00' : 'T21:00:00');
    const res = await fetch('/api/google/calendar/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary, startISO: start, endISO: end, calendarId: selectedCal })
    });
    if (res.ok) {
      setSummary(''); setDate(''); setTimeSlot('全日');
      fetchGoogle(selectedCal);
    } else {
      alert('Googleカレンダー追加に失敗しました（ログインや権限が必要かもしれません）');
    }
  };

  const deleteGoogleEvent = async (id) => {
    const res = await fetch('/api/google/calendar/event/' + encodeURIComponent(id) + '?calendarId=' + encodeURIComponent(selectedCal), { method: 'DELETE' });
    if (res.ok) fetchGoogle(selectedCal);
  };

  // Embed URL: 優先度 1) props.embedUrl が指定されている 2) 選択カレンダーIDから推定生成
  const computedEmbed = (() => {
    if (embedUrl && embedUrl.trim()) return embedUrl;
    // 選択 calId がメールアドレス or group.calendar.google.com の場合は組み立て可能
    if (!selectedCal) return '';
    const src = encodeURIComponent(selectedCal);
    // タイムゾーン: Asia/Tokyo
    return `https://calendar.google.com/calendar/embed?src=${src}&ctz=Asia%2FTokyo`;
  })();

  return (
    <section className="card">
      <h2>共有スケジュール（Googleカレンダー連携 / カレンダー選択可）</h2>

      <div className="row" style={{alignItems:'center', marginBottom: 12}}>
        <label style={{color:'#9aa0b4'}}>カレンダー：</label>
        <select className="select" value={selectedCal} onChange={e=>setSelectedCal(e.target.value)}>
          {calendars.map(c => (
            <option key={c.id} value={c.id}>
              {c.primary ? '★ ' : ''}{c.summary} ({c.id})
            </option>
          ))}
        </select>
        <span className="badge badge--ok">{gEvents.length} 件</span>
      </div>

      {computedEmbed ? (
        <div style={{marginBottom:16}}>
          <iframe
            title="Google Calendar"
            src={computedEmbed}
            style={{border:0, width:'100%', height:'620px', borderRadius:'16px'}}
            frameBorder="0"
            scrolling="no"
          />
          <p style={{color:'#9aa0b4', marginTop:8, fontSize:12}}>
            ※ iframe 埋め込みは公開または共有設定されたカレンダーのみ表示されます。
          </p>
        </div>
      ) : null}

      <div className="row" style={{alignItems:'center', marginTop:4}}>
        <input className="input" placeholder="タイトル" value={summary} onChange={e=>setSummary(e.target.value)} />
        <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <select className="select" value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}>
          <option>全日</option><option>昼</option><option>夜</option>
        </select>
        <input className="input" placeholder="作成者（共有DB側）" value={createdBy} onChange={e=>setCreatedBy(e.target.value)} />
        <button className="button" onClick={submitShared}>共有DBに追加</button>
        <button className="button" onClick={addGoogleEvent}>Googleに追加</button>
      </div>

      <h3 style={{marginTop:16}}>Googleカレンダーの予定（直近1週間）</h3>
      <ul className="list">
        {gEvents.map(ev => (
          <li key={ev.id} className="item">
            {ev.summary || '(無題)'}：
            {ev.start?.dateTime || ev.start?.date} → {ev.end?.dateTime || ev.end?.date}
            <button className="button" style={{marginLeft:12}} onClick={()=>deleteGoogleEvent(ev.id)}>削除</button>
          </li>
        ))}
      </ul>

      <h3 style={{marginTop:16}}>共有DBの予定（個人スケジュールも含む）</h3>
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
