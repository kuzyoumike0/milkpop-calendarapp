import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './calendar.css'; // 必要に応じてスタイル分け

export default function Calendar({ type }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [events, setEvents] = useState([]);
  const userId = 'user1';

  const fetchData = async () => {
    try {
      if (type === 'shared') {
        const res = await axios.get(`/api/shared?date=${date}`);
        setEvents(res.data);
      } else {
        const res = await axios.get(`/api/personal?user_id=${userId}&date=${date}`);
        setEvents(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, [date]);

  const addEvent = async () => {
    if (!title) return alert('イベント名を入力してください');
    try {
      if (type === 'shared') {
        await axios.post('/api/shared', { title, time_slot: timeSlot, created_by: userId, date });
      } else {
        await axios.post('/api/personal', { title, time_slot: timeSlot, user_id: userId, date });
      }
      setTitle('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('追加に失敗しました');
    }
  };

  const deleteEvent = async (id) => {
    try {
      await axios.delete(`/api/${type === 'shared' ? 'shared' : 'personal'}/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h1>{type === 'shared' ? '共有カレンダー' : '個人カレンダー'}</h1>
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
      <div className="calendar-list">
        {events.length === 0 ? <p>予定なし</p> :
          events.map(e => (
            <div key={e.id} className={`event ${e.time_slot}`}>
              <strong>{e.time_slot}</strong>: {e.title}
              {type === 'shared' && ` (${e.created_by})`}
              <button onClick={() => deleteEvent(e.id)}>削除</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}
