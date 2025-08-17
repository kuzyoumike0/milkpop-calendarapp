
import React from "react";
import axios from "axios";

export default function PersonalCalendar(){
  const [events, setEvents] = React.useState([]);
  const [calendar, setCalendar] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(()=>{
    async function run(){
      const cals = await axios.get("/api/calendars");
      const cal = (cals.data||[])[0] || null;
      setCalendar(cal);
      // fetch schedules for this calendar only
      if (cal) {
        const res = await axios.get("/api/schedules", { params: { calendarIds: String(cal.id) } });
        setEvents(res.data || []);
      }
      setLoading(false);
    }
    run();
  },[]);

  if(loading) return <div className="panel">読み込み中...</div>;

  return (
    <div className="panel">
      <div className="kicker">PERSONAL</div>
      <h2 style={{marginTop:6}}>個人カレンダー{calendar ? `（${calendar.name}）` : ''}</h2>
      {(events||[]).length===0 ? <div>まだ予定がありません。</div> : (
        <ul style={{display:'grid', gap:10, paddingLeft:0, listStyle:'none'}}>
          {events.map(e => (
            <li key={e.id} className="item">
              <div className="left">
                <span className="dot" style={{background: e.calendar_color || (calendar && calendar.color) || '#60a5fa'}}></span>
                <span className="badge">{e.date}</span>
                <span className="badge">{e.timeslot}</span>
                <span className="title">{e.title}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
