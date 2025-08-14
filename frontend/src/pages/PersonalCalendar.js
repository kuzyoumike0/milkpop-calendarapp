import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PersonalCalendar() {
  const userId = 'user1';
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [personal, setPersonal] = useState([]);

  const fetchData = async () => {
    const res = await axios.get(`/api/personal/${userId}?date=${date}`);
    setPersonal(res.data);
  };

  useEffect(() => { fetchData(); }, [date]);

  const addEvent = async () => {
    if (!title) return alert('イベント名を入力してください');
    await axios.post('/api/personal', { user_id: userId, title, time_slot: timeSlot, date });
    setTitle('');
    fetchData();
  };

  const deletePersonal = async (id) => {
    await axios.delete(`/api/personal/${userId}/${id}`);
    fetchData();
  };

  return (
    <div className="container">
      <h1>個人カレンダー</h1>
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
        {personal.map(e => (
          <div key={e.id} className={`event ${e.time_slot}`}>
            <strong>{e.time_slot}</strong>: {e.title}
            <button onClick={() => deletePersonal(e.id)}>削除</button>
          </div>
        ))}
        {personal.length === 0 && <p>予定なし</p>}
      </div>
    </div>
  );
}
