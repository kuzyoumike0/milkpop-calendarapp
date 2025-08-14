import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Calendar({ type }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [events, setEvents] = useState([]);
  const userId = 'user1';

  const fetchData = async () => {
    try {
      const url = type === 'shared' 
        ? `/api/shared?date=${date}` 
        : `/api/personal?user_id=${userId}&date=${date}`;
      const res = await axios.get(url);
      setEvents(res.data);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [date]);

  const addEvent = async () => {
    if (!title) return alert('イベント名を入力してください');
    try {
      const url = type === 'shared' ? '/api/shared' : '/api/personal';
      const payload = type === 'shared' 
        ? { title, time_slot: timeSlot, created_by: userId, date } 
        : { title, time_slot: timeSlot, user_id: userId, date };
      await axios.post(url, payload);
      setTitle('');
      fetchData();
    } catch(e) { console.error(e); alert('追加失敗'); }
  };

  return (
    <div>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="イベント名"/>
      <select value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}>
        <option>全日</option>
        <option>昼</option>
        <option>夜</option>
      </select>
      <button onClick={addEvent}>{type === 'shared' ? '共有カレンダーに追加' : '個人カレンダーに追加'}</button>

      <h2>{type === 'shared' ? '共有カレンダー' : '個人カレンダー'}</h2>
      {events.length === 0 ? <p>予定なし</p> : 
        events.map(e => (
          <div key={e.id}>
            <strong>{e.time_slot}</strong>: {e.title} {type==='shared' && `(${e.created_by})`}
          </div>
      ))}
    </div>
  );
}
