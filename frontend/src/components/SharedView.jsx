
import React from 'react';
import axios from 'axios';
import CalendarPicker from './CalendarPicker';

export default function SharedView({ token }){
  const [events, setEvents] = React.useState([]);
  const [calendars, setCalendars] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [selected, setSelected] = React.useState(new Set());
  const [rows, setRows] = React.useState([]); // [{date, title, mode}]
  const [calendarId, setCalendarId] = React.useState(null);
  const [shareUrl, setShareUrl] = React.useState("");

  React.useEffect(()=>{
    axios.get(`/api/share/${token}`).then(res=>{
      setEvents(res.data && res.data.schedules ? res.data.schedules : []);
      setCalendars(res.data && res.data.calendars ? res.data.calendars : []);
      if (res.data && res.data.calendars && res.data.calendars[0]) {
        setCalendarId(res.data.calendars[0].id);
      }
    }).finally(()=> setLoading(false));
  },[token]);

  React.useEffect(()=>{
    const arr = Array.from(selected).sort();
    setRows(prev => {
      const map = new Map(prev.map(r => [r.date, r]));
      return arr.map(d => map.get(d) || ({ date: d, title: "", mode: "allday" }));
    });
  }, [selected]);

  const setRow = (date, patch) => {
    setRows(rs => rs.map(r => r.date === date ? { ...r, ...patch } : r));
  };

  const share = async () => {
    const items = rows
      .filter(r => r.title && r.date)
      .map(r => {
        const timeslot =
          r.mode === "noon" ? "昼" :
          r.mode === "night" ? "夜" : "全日";
        return { date: r.date, title: r.title, timeslot, calendar_id: calendarId };
      });
    if (items.length === 0) return;
    const resp = await axios.post('/api/share-items', { items, default_calendar_id: calendarId });
    const url = resp.data && resp.data.url ? resp.data.url : "";
    setShareUrl(url);
    try { await navigator.clipboard.writeText((typeof window !== 'undefined' ? window.location.origin : "") + url); } catch {}
  };

  if (loading) return <div className="panel">読み込み中...</div>;

  return (
    <div className="grid">
      <section className="col-8">
        <div className="panel">
          <div className="kicker">SHARED</div>
          <h2 style={{marginTop:6}}>日付共有設定</h2>
          <div className="sub" style={{marginBottom:12}}>
            左で日付をドラッグして範囲選択、右で各日付の「名前」と「区分」を指定して共有リンクを発行します。
          </div>
          <CalendarPicker
            value={selected}
            onChange={setSelected}
            highlightColor={(calendars.find(c=>c.id===calendarId)?.color) || "#22d3ee"}
            mode="range"
            size="sm"
            variant="card"
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
          <hr className="sep" />
          <div className="kicker">ENTRIES</div>
          <h3 style={{margin:'6px 0 12px'}}>選択した日付（昇順）</h3>
          <div style={{display:'grid', gap:10, maxHeight:'48vh', overflow:'auto'}}>
            {rows.length === 0 ? (
              <div className="note">左のカレンダーから日付を選んでください。</div>
            ) : (
              rows.map(r => (
                <div key={r.date} className="card">
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                    <div className="date">{r.date}</div>
                  </div>
                  <div className="field">
                    <label>名前</label>
                    <input
                      type="text"
                      placeholder="例) 田中 / 会議"
                      value={r.title}
                      onChange={e=> setRow(r.date, { title: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>区分</label>
                    <select
                      value={r.mode}
                      onChange={e=> setRow(r.date, { mode: e.target.value })}
                    >
                      <option value="allday">終日</option>
                      <option value="noon">昼</option>
                      <option value="night">夜</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{display:'grid', gap:10, marginTop:12}}>
            <button className="btn" type="button" onClick={share} disabled={rows.length===0}>共有リンクを発行</button>
            {shareUrl && (
              <input
                type="text"
                readOnly
                value={(typeof window !== 'undefined' ? window.location.origin : "") + shareUrl}
              />
            )}
            <div className="note">毎回新しい共有リンクを発行し、上の入力欄に表示します。</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
