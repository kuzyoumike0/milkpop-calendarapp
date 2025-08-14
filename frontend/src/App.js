import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [shared, setShared] = useState([]);
  const [personal, setPersonal] = useState([]);
  const userId = 'user1';

  const fetchData = async () => {
    const s = await axios.get(`/api/shared?date=${date}`);
    const p = await axios.get(`/api/personal?user_id=${userId}&date=${date}`);
    setShared(s.data); setPersonal(p.data);
  };

  useEffect(() => { fetchData(); }, [date]);

  return (
    <div>
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
      <input placeholder="イベント名" value={title} onChange={e=>setTitle(e.target.value)} />
      <select value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}>
        <option>全日</option><option>昼</option><option>夜</option>
      </select>
      <button onClick={fetchData}>更新</button>

      <h3>共有カレンダー</h3>
      <ul>{shared.map(e=><li key={e.id}>{e.time_slot}: {e.title} ({e.created_by})</li>)}</ul>

      <h3>個人カレンダー</h3>
      <ul>{personal.map(e=><li key={e.id}>{e.time_slot}: {e.title}</li>)}</ul>
    </div>
  );
}
