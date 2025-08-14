import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Calendar({ type }) {
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const userId = 'user1';

  const fetchEvents = async () => {
    try {
      const url = type === 'shared' 
        ? `/api/shared?date=${date}` 
        : `/api/personal?user_id=${userId}&date=${date}`;
      const res = await axios.get(url);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchEvents(); }, [date]);

  const addEvent = async () => {
    if (!title) return alert('イベント名を入力してください');
    try {
      const url = type === 'shared' ? '/api/shared' : '/api/personal';
      const data = type === 'shared' 
        ? { title, time_slot: timeSlot, created_by: userId, date }
        : { title, time_slot: timeSlot, user_id: userId, date };
      await axios.post(url, data);
      setTitle('');
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>{type === 'shared' ? '共有カレンダー' : '個人カレンダー'}</h2>
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="イベント名" />
      <select value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}>
        <option>全日</option>
        <option>昼</option>
        <option>夜</option>
      </select>
      <button onClick={addEvent}>追加</button>

      <ul>
        {events.map(e => (
          <li key={e.id}>
            {e.time_slot}: {e.title} {type === 'shared' && `(${e.created_by})`}
          </li>
        ))}
      </ul>
    </div>
  );
}
