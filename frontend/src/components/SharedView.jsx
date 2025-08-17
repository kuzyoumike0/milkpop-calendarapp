
import React from 'react';
import axios from 'axios';
import CalendarPicker from './CalendarPicker';

const HOURS = Array.from({length: 25}, (_,h)=> String(h).padStart(2,'0') + ':00'); // 00:00 - 24:00

export default function SharedView({ token }){
  const [events, setEvents] = React.useState([]);
  const [calendars, setCalendars] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Editor state
  const [selected, setSelected] = React.useState(new Set()); // selected dates
  const [rows, setRows] = React.useState([]); // [{date, title, mode, timeslot, start_time, end_time}]
  const [calendarId, setCalendarId] = React.useState(null);
  const [selectionMode, setSelectionMode] = React.useState('range');

  React.useEffect(()=>{
    axios.get(`/api/share/${token}`).then(res=>{
      setEvents(res.data.schedules || []);
      setCalendars(res.data.calendars || []);
      if ((res.data.calendars||[])[0]) setCalendarId(res.data.calendars[0].id);
    }).finally(()=> setLoading(false));
  },[token]);

  // Sync rows from selected dates
  React.useEffect(()=>{
    const arr = Array.from(selected).sort();
    setRows(prev => {
      const map = new Map(prev.map(r=> [r.date, r]));
      return arr.map(d => map.get(d) || ({date:d, title:'', mode:'allday', timeslot:'全日', start_time:null, end_time:null}));
    });
  }, [selected]);

  const setRow = (date, patch)=>{
    setRows(rs => rs.map(r => r.date===date ? {...r, ...patch} : r));
  };

  const save = async ()=>{
    const items = rows
      .filter(r => r.title && r.date)
      .map(r => {
        if (r.mode === 'allday') return { date: r.date, title: r.title, timeslot: '全日', calendar_id: calendarId };
        if (r.mode === 'noon') return { date: r.date, title: r.title, timeslot: '昼', calendar_id: calendarId };
        if (r.mode === 'night') return { date: r.date, title: r.title, timeslot: '夜', calendar_id: calendarId };
        if (r.mode === 'ng') return { date: r.date, title: r.title || '✖', timeslot: '✖', calendar_id: calendarId };
        // time range
        return { date: r.date, title: r.title, timeslot: '時間', start_time: r.start_time, end_time: r.end_time, calendar_id: calendarId };
      });
    if (items.length === 0) return;
    await axios.post('/api/schedules/bulk', { items, default_calendar_id: calendarId });
    // reload events
    const res = await axios.get(`/api/share/${token}`);
    setEvents(res.data.schedules || []);
    setSelected(new Set());
  };

  if(loading) return <div className="panel">読み込み中...</div>;

  return (
    <div className="grid">
      <section className="col-8">
        <div className="panel">
          <div className="kicker">SHARED</div>
          <h2 style={{marginTop:6}}>共有カレンダー</h2>
          <div className="sub" style={{marginBottom:12}}>左で日付を選択、右で各日付の内容と時間帯を設定できます。</div>
          <CalendarPicker
            value={selected}
            onChange={setSelected}
            highlightColor={(calendars.find(c=>c.id===calendarId)?.color) || "#22d3ee"}
            mode={selectionMode}
            size="sm"
          />
        </div>
      </section>
      <aside className="col-4">
        <div className="panel">
          <div className="field">
            <label>対象カレンダー</label>
            <select value={calendarId || ''} onChange={e=> setCalendarId(parseInt(e.target.value,10))}>
              {calendars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>日付の選択方法</label>
            <div style={{display:'flex', gap:12}}>
              <label><input type="radio" name="selmode" value="range" checked={selectionMode==='range'} onChange={()=>setSelectionMode('range')} /> 範囲選択</label>
              <label><input type="radio" name="selmode" value="multi" checked={selectionMode==='multi'} onChange={()=>setSelectionMode('multi')} /> 複数選択</label>
            </div>
          </div>
          <hr className="sep" />
          <div className="kicker">ENTRIES</div>
          <h3 style={{margin:'6px 0 12px'}}>選択した日付（自動で昇順ソート）</h3>
          <div style={{display:'grid', gap:10, maxHeight: '48vh', overflow:'auto'}}>
            {rows.length===0 ? <div className="note">左のカレンダーから日付を選んでください。</div> :
              rows.map(r => (
                <div key={r.date} className="card">
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                    <div className="date">{r.date}</div>
                  </div>
                  <div className="field">
                    <label>名前</label>
                    <input type="text" placeholder="例) 田中 / 会議" value={r.title} onChange={e=> setRow(r.date, {title: e.target.value})} />
                  </div>
                  <div className="field">
                    <label>時間帯の選択</label>
                    <div style={{display:'grid', gap:6}}>
                      <label><input type="radio" name={`mode-${r.date}`} checked={r.mode==='allday'} onChange={()=> setRow(r.date, {mode:'allday', timeslot:'全日'})} /> 終日</label>
                      <label><input type="radio" name={`mode-${r.date}`} checked={r.mode==='noon'} onChange={()=> setRow(r.date, {mode:'noon', timeslot:'昼'})} /> 昼</label>
                      <label><input type="radio" name={`mode-${r.date}`} checked={r.mode==='night'} onChange={()=> setRow(r.date, {mode:'night', timeslot:'夜'})} /> 夜</label>
                      <label><input type="radio" name={`mode-${r.date}`} checked={r.mode==='ng'} onChange={()=> setRow(r.date, {mode:'ng', timeslot:'✖'})} /> ✖（不可）</label>
                      <label style={{display:'flex', alignItems:'center', gap:8}}>
                        <input type="radio" name={`mode-${r.date}`} checked={r.mode==='time'} onChange={()=> setRow(r.date, {mode:'time'})} /> 
                        時間指定：
                        <select value={r.start_time || '09:00'} onChange={e=> setRow(r.date, {start_time: e.target.value, mode:'time'})}>
                          {HOURS.map(h => <option key={'s'+h} value={h}>{h}</option>)}
                        </select>
                        〜
                        <select value={r.end_time || '18:00'} onChange={e=> setRow(r.date, {end_time: e.target.value, mode:'time'})}>
                          {HOURS.map(h => <option key={'e'+h} value={h}>{h}</option>)}
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
          <div style={{display:'flex', gap:10, marginTop:12}}>
            <button className="btn" type="button" onClick={save} disabled={rows.length===0}>保存</button>
            <button className="btn btn-secondary" type="button" onClick={()=>{ setSelected(new Set()); setRows([]); }}>クリア</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
