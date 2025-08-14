import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [shared, setShared] = useState([]);
  const [personal, setPersonal] = useState([]);
  const userId = 'user1';

  const fetchData = async () => {
    try {
      const s = await axios.get(`/api/shared?date=${date}`);
      const p = await axios.get(`/api/personal?user_id=${userId}&date=${date}`);
      setShared(s.data); setPersonal(p.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, [date]);

  return (
    <div className="container">
      <h1>Milkpop カレンダー</h1>
      <div className="controls">
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <input placeholder="イベント名" value={title} onChange={e=>setTitle(e.target.value)} />
        <select value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}>
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
        </select>
        <button onClick={fetchData}>更新</button>
      </div>

      <div className="calendars">
        <div className="calendar-card">
          <h2>共有カレンダー</h2>
          {shared.length === 0 ? <p>予定なし</p> :
            shared.map(e => (
              <div key={e.id} className={`event ${e.time_slot}`}>
                <strong>{e.time_slot}</strong>: {e.title} ({e.created_by})
              </div>
            ))
          }
        </div>

        <div className="calendar-card">
          <h2>個人カレンダー</h2>
          {personal.length === 0 ? <p>予定なし</p> :
            personal.map(e => (
              <div key={e.id} className={`event ${e.time_slot}`}>
                <strong>{e.time_slot}</strong>: {e.title}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
