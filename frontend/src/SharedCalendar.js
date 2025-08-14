import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SharedCalendar() {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [userName, setUserName] = useState('');
  const [shared, setShared] = useState([]);

  const fetchShared = async () => {
    if(!date) return;
    try {
      const res = await axios.get(`/api/shared?date=${date}`);
      setShared(res.data);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchShared(); }, [date]);

  const addEvent = async () => {
    if(!userName) return alert('ユーザー名を入力してください');
    if(!title) return alert('イベント名を入力してください');
    try {
      await axios.post('/api/shared', { title, time_slot: timeSlot, created_by: userName, date });
      setTitle('');
      fetchShared();
    } catch(err) { console.error(err); alert('追加に失敗しました'); }
  };

  const deleteEvent = async (id) => {
    try {
      await axios.delete(`/api/shared/${id}`);
      fetchShared();
    } catch(err) { console.error(err); }
  };

  return (
    <div className="container">
      <h1>共有カレンダー</h1>
      <div className="controls">
        <input placeholder="ユーザー名" value={userName} onChange={e=>setUserName(e.target.value)} />
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <input placeholder="イベント名" value={title} onChange={e=>setTitle(e.target.value)} />
        <select value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}>
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
        </select>
        <button onClick={addEvent}>追加</button>
      </div>
      <div>
        {shared.map(e=>(
          <div key={e.id} className={`event ${e.time_slot}`}>
            {e.time_slot}: {e.title} ({e.created_by})
            <button onClick={()=>deleteEvent(e.id)}>削除</button>
          </div>
        ))}
        {shared.length===0 && <p>予定なし</p>}
      </div>
    </div>
  );
}
