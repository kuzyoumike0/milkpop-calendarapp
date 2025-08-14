import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [userName, setUserName] = useState('');
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [events, setEvents] = useState({}); // { '2025-08-14': { shared: [], personal: [] } }

  const formatDate = (date) => date.toISOString().slice(0, 10);

  const fetchData = async () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const data = {};
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDate(new Date(d));
      try {
        const s = await axios.get(`/api/shared?date=${dateStr}`);
        const p = await axios.get(`/api/personal?user_id=${userName}&date=${dateStr}`);
        data[dateStr] = { shared: s.data, personal: p.data };
      } catch (err) {
        console.error(err);
        data[dateStr] = { shared: [], personal: [] };
      }
    }
    setEvents(data);
  };

  useEffect(() => {
    if (userName) fetchData();
  }, [currentMonth, userName]);

  const addEvent = async (type, date) => {
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

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let d = 1; d <= lastDate; d++) calendarDays.push(new Date(year, month, d));

    return calendarDays.map((day, idx) => {
      if (!day) return <div key={idx} className="calendar-cell empty"></div>;
      const dateStr = formatDate(day);
      const dayEvents = events[dateStr] || { shared: [], personal: [] };
      return (
        <div key={idx} className="calendar-cell">
          <h4>{day.getDate()}</h4>
          <div className="events-list">
            {dayEvents.shared.map(e => (
              <div key={e.id} className={`event ${e.time_slot}`}>
                <span>{e.time_slot}: {e.title} ({e.created_by})</span>
                <button className="delete-btn" onClick={() => deleteEvent('shared', e.id)}>削除</button>
              </div>
            ))}
            {dayEvents.personal.map(e => (
              <div key={e.id} className={`event ${e.time_slot}`}>
                <span>{e.time_slot}: {e.title}</span>
                <button className="delete-btn" onClick={() => deleteEvent('personal', e.id)}>削除</button>
              </div>
            ))}
          </div>
          <div className="add-event-buttons">
            <button onClick={() => addEvent('shared', dateStr)}>共有追加</button>
            <button onClick={() => addEvent('personal', dateStr)}>個人追加</button>
          </div>
        </div>
      );
    });
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() -1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() +1, 1));

  return (
    <div className="container">
      <h1>Milkpop カレンダー</h1>
      <div className="controls">
        <input placeholder="ユーザー名" value={userName} onChange={e=>setUserName(e.target.value)} />
        <input placeholder="イベント名" value={title} onChange={e=>setTitle(e.target.value)} />
        <select value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}>
          <option>全日</option>
          <option>昼</option>
          <option>夜</option>
        </select>
        <button onClick={prevMonth}>前の月</button>
        <button onClick={nextMonth}>次の月</button>
      </div>

      <div className="calendar-grid">
        {renderCalendar()}
      </div>
    </div>
  );
}
