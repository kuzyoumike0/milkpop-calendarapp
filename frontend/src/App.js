import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [userName, setUserName] = useState('');
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [shared, setShared] = useState([]);
  const [personal, setPersonal] = useState([]);

  const fetchData = async () => {
    try {
      const s = await axios.get(`/api/shared?date=${date}`);
      const p = await axios.get(`/api/personal?user_id=${userName}&date=${date}`);
      setShared(s.data);
      setPersonal(p.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, [date, userName]);

  const addEvent = async (type) => {
    if (!userName) return alert('ユーザー名を入力してください');
    if (!title) return alert('イベント名を入力してください');
    try {
      if (type === 'shared') {
        await axios.post('/api/shared', { title, time_slot: timeSlot, created_by: userName, date });
      } else {
        await axios.post('/api/personal', { title, time_slot: timeSlot, user_id: userName, date });
      }
      setTitle('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('追加に失敗しました');
    }
  };

  const deleteEvent = async (type, id) => {
    try {
      await axios.delete(`/api/${type}/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました');
    }
  };

  return (
    <div className="container">
      <h1>Milkpop カレンダー</h1>

      {/* 入力フォーム */}
      <div className="controls">
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <input placeholder="ユーザー名" value={userName} onChange={e=>setUserName(e.target.value)} />
        <input placeholder="イベント名" value={title} onChange={e=>setTitle(e.target.value)} />
        <select value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}>
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
        </select>
        <button onClick={() => addEvent('shared')}>共有カレンダーに追加</button>
        <button onClick={() => addEvent('personal')}>個人カレンダーに追加</button>
      </div>

      {/* カレンダー表示 */}
      <div className="calendar-grid">
        <div className="calendar-cell">
          <h3>{date}</h3>
          <div className="events-list">
            <h4>共有</h4>
            {shared.length === 0 ? <p>予定なし</p> :
              shared.map(e => (
                <div key={e.id} className={`event ${e.time_slot}`}>
                  <span><strong>{e.time_slot}</strong>: {e.title} ({e.created_by})</span>
                  <button className="delete-btn" onClick={() => deleteEvent('shared', e.id)}>削除</button>
                </div>
              ))
            }
            <h4>個人</h4>
            {personal.length === 0 ? <p>予定なし</p> :
              personal.map(e => (
                <div key={e.id} className={`event ${e.time_slot}`}>
                  <span><strong>{e.time_slot}</strong>: {e.title}</span>
                  <button className="delete-btn" onClick={() => deleteEvent('personal', e.id)}>削除</button>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
