import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PersonalCalendar() {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [userId, setUserId] = useState('');
  const [personal, setPersonal] = useState([]);

  const fetchPersonal = async () => {
    if(!userId) return;
    try {
      const res = await axios.get(`/api/personal?user_id=${userId}&date=${date}`);
      setPersonal(res.data);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchPersonal(); }, [date, userId]);

  const addEvent = async () => {
    if(!userId) return alert('ユーザーIDを入力してください');
    if(!title) return alert('イベント名を入力してください');
    try {
      await axios.post('/api/personal', { title, time_slot: timeSlot, user_id: userId, date });
      setTitle('');
      fetchPersonal();
    } catch(err) { console.error(err); alert('追加に失敗しました'); }
  };

  const deleteEvent = async (id) => {
    try {
      await axios.delete(`/api/personal/${id}`);
      fetchPersonal();
    } catch(err) { console.error(err); }
  };

  return (
    <div className="container">
      <h1>個人カレンダー</h1>
      <div className="controls">
        <input placeholder="ユーザーID" value={userId} onChange={e=>setUserId(e.target.value)} />
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
        {personal.map(e=>(
          <div key={e.id} className={`event ${e.time_slot}`}>
            {e.time_slot}: {e.title}
            <button onClick={()=>deleteEvent(e.id)}>削除</button>
          </div>
        ))}
        {personal.length===0 && <p>予定なし</p>}
      </div>
    </div>
  );
}
