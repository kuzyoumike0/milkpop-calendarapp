import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

export default function App() {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [shared, setShared] = useState([]);
  const [personal, setPersonal] = useState([]);
  const userId = 'user1';

  const fetchData = async () => {
    const s = await axios.get(`/api/shared?date=${date}`);
    const p = await axios.get(`/api/personal/${userId}?date=${date}`);
    setShared(s.data); setPersonal(p.data);
  };

  useEffect(() => { fetchData(); }, [date]);

  const addEvent = async (type) => {
    if (!title) return alert('イベント名を入力してください');
    try {
      if (type === 'shared') {
        await axios.post('/api/shared', { title, time_slot: timeSlot, created_by: userId, date });
      } else {
        if(shared.length===0) return alert('まず共有カレンダーを追加してください');
        await axios.post('/api/personal', { shared_id: shared[0].id, note: title, user_id: userId, date });
      }
      setTitle('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('追加に失敗しました');
    }
  };

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
        <button onClick={() => addEvent('shared')}>共有カレンダーに追加</button>
        <button onClick={() => addEvent('personal')}>個人カレンダーに追加</button>
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
              <div key={e.id} className={`event`}>
                {e.note}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
