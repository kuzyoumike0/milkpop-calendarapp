import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SharedCalendar() {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [shared, setShared] = useState([]);
  const userId = 'user1';

  const fetchData = async () => {
    const res = await axios.get(`/api/shared?date=${date}`);
    setShared(res.data);
  };

  useEffect(() => { fetchData(); }, [date]);

  const addEvent = async () => {
    if (!title) return alert('イベント名を入力してください');
    await axios.post('/api/shared', { title, time_slot: timeSlot, created_by: userId, date });
    setTitle('');
    fetchData();
  };

  const deleteShared = async (id) => {
    await axios.delete(`/api/shared/${id}`);
    fetchData();
  };

  return (
    <div className="container">
      <h1>共有カレンダー</h1>
      <div className="controls">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input placeholder="イベント名" value={title} onChange={e => setTitle(e.target.value)} />
        <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
        </select>
        <button onClick={addEvent}>追加</button>
      </div>

      <div className="calendars">
        {shared.map(e => (
          <div key={e.id} className={`event ${e.time_slot}`}>
            <strong>{e.time_slot}</strong>: {e.title} ({e.created_by})
            <button onClick={() => deleteShared(e.id)}>削除</button>
          </div>
        ))}
        {shared.length === 0 && <p>予定なし</p>}
      </div>
    </div>
  );
}
