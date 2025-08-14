import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function App() {
  const [users, setUsers] = useState([]);
  const [sharedCalendars, setSharedCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [schedules, setSchedules] = useState([]);

  const [newUserName, setNewUserName] = useState('');
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newCalendarDesc, setNewCalendarDesc] = useState('');
  const [newSchedule, setNewSchedule] = useState({
    user_id: '',
    shared_calendar_id: '',
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  });

  // データ取得（ユーザーとカレンダー）
  useEffect(() => { /* 必要に応じて GET API 実装 */ }, []);
  useEffect(() => { if (selectedCalendarId) fetchSchedules(selectedCalendarId); }, [selectedCalendarId]);

  const fetchSchedules = async (calendarId) => {
    try {
      const res = await axios.get(`${API_URL}/shared-calendars/${calendarId}/schedules`);
      setSchedules(res.data);
    } catch { alert('スケジュール取得失敗'); }
  };

  const createUser = async () => {
    try {
      const res = await axios.post(`${API_URL}/users`, { name: newUserName });
      setUsers([...users, res.data]);
      setNewUserName('');
    } catch { alert('ユーザー作成失敗'); }
  };

  const createSharedCalendar = async () => {
    try {
      const res = await axios.post(`${API_URL}/shared-calendars`, {
        name: newCalendarName,
        description: newCalendarDesc,
      });
      setSharedCalendars([...sharedCalendars, res.data]);
      setNewCalendarName('');
      setNewCalendarDesc('');
      setSelectedCalendarId(res.data.id);
    } catch { alert('共有カレンダー作成失敗'); }
  };

  const createSchedule = async () => {
    try {
      await axios.post(`${API_URL}/personal-schedules`, newSchedule);
      fetchSchedules(newSchedule.shared_calendar_id);
      setNewSchedule({ ...newSchedule, title: '', description: '', start_time: '', end_time: '' });
    } catch { alert('スケジュール作成失敗'); }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>カレンダー共有サイト</h1>

      <section>
        <h2>ユーザー作成</h2>
        <input value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="ユーザー名"/>
        <button onClick={createUser}>作成</button>
      </section>

      <section>
        <h2>共有カレンダー作成</h2>
        <input value={newCalendarName} onChange={e => setNewCalendarName(e.target.value)} placeholder="カレンダー名"/>
        <input value={newCalendarDesc} onChange={e => setNewCalendarDesc(e.target.value)} placeholder="説明"/>
        <button onClick={createSharedCalendar}>作成</button>
      </section>

      <section>
        <h2>共有カレンダー選択</h2>
        <select onChange={e => setSelectedCalendarId(e.target.value)} value={selectedCalendarId || ''}>
          <option value="" disabled>選択してください</option>
          {sharedCalendars.map(sc => (<option key={sc.id} value={sc.id}>{sc.name}</option>))}
        </select>
      </section>

      {selectedCalendarId && (
        <>
          <section>
            <h2>個人スケジュール作成</h2>

            <select value={newSchedule.user_id} onChange={e => setNewSchedule({ ...newSchedule, user_id: e.target.value })}>
              <option value="">ユーザー選択</option>
              {users.map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}
            </select>

            <select
              value={newSchedule.title}
              onChange={e => {
                const title = e.target.value;
                const today = new Date().toISOString().split("T")[0];
                let start, end;

                if (title === "全日") { start = `${today}T10:00`; end = `${today}T23:59`; }
                else if (title === "昼") { start = `${today}T13:00`; end = `${today}T19:00`; }
                else if (title === "夜") { start = `${today}T21:00`; end = `${today}T23:59`; }
                else { start = ""; end = ""; }

                setNewSchedule({ ...newSchedule, title, start_time: start, end_time: end, shared_calendar_id: selectedCalendarId });
              }}
            >
              <option value="">シフト選択</option>
              <option value="全日">全日 (10:00～0:00)</option>
              <option value="昼">昼 (13:00～19:00)</option>
              <option value="夜">夜 (21:00～0:00)</option>
            </select>

            <input
              placeholder="説明"
              value={newSchedule.description}
              onChange={e => setNewSchedule({ ...newSchedule, description: e.target.value })}
            />
            <button onClick={createSchedule}>作成</button>
          </section>

          <section>
            <h2>スケジュール一覧</h2>
            <ul>
              {schedules.map(s => (
                <li key={s.id}>
                  <strong>{s.title}</strong> - {s.user_name} <br/>
                  {new Date(s.start_time).toLocaleString()} ～ {new Date(s.end_time).toLocaleString()} <br/>
                  {s.description}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

export default App;
