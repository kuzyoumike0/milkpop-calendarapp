import React from 'react';
import axios from 'axios';

export default function SharedView({ token }){
  const [events, setEvents] = React.useState([]);
  const [calendars, setCalendars] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(()=>{
    axios.get(`/api/share/${token}`).then(res=>{
      setEvents(res.data.schedules || []);
      setCalendars(res.data.calendars || []);
    }).finally(()=> setLoading(false));
  },[token]);

  if(loading) return <div className="panel">読み込み中...</div>;

  return (
    <div className="panel">
      <div className="kicker">SHARED</div>
      <h2 style={{marginTop:6}}>共有ビュー</h2>
      <div className="note" style={{marginBottom:12}}>
        表示中カレンダー: {calendars.map(c=>c.name).join(', ') || 'なし'}
      </div>
      {(events||[]).length === 0 ? <div>予定がありません。</div> : (
        <ul style={{display:'grid', gap:8, paddingLeft:0, listStyle:'none'}}>
          {events.map(e => (
            <li key={e.id} className="item">
              <div className="left">
                <span className="dot" style={{background: e.calendar_color || '#60a5fa'}}></span>
                <span className="badge">{e.date}</span>
                <span className="badge">{e.timeslot}</span>
                <span className="title">{e.title}</span>
              </div>
              <div className="badges"><span className="badge">{e.calendar_name}</span></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
