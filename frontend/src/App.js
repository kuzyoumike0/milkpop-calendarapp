import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [shared, setShared] = useState([]);
  const [personal, setPersonal] = useState([]);
  const userId = 'user1'; // ダミーID

  const fetchData = async () => {
    const s = await axios.get(`/api/shared?date=${date}`);
    const p = await axios.get(`/api/personal?user_id=${userId}&date=${date}`);
    setShared(s.data);
    setPersonal(p.data);
  };

  useEffect(() => { fetchData(); }, [date]);

  const addEvent = async (type) => {
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

  const deleteEvent = async (type, id) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      if (type === 'shared') {
        await axios.delete(`/api/shared/${id}`);
      } else {
        await axios.delete(`/api/personal/${id}`);
      }
      fetchData();
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました');
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
                <button className="delete-btn" onClick={() => deleteEvent('shared', e.id)}>削除</button>
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
                <button className="delete-btn" onClick={() => deleteEvent('personal', e.id)}>削除</button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
