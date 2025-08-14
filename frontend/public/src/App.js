import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function App() {
  const [users, setUsers] = useState([]);
  const [sharedCalendars, setSharedCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [schedules, setSchedules] = useState([]);

  // フォーム状態
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
    type: '全日'
  });

  // 初期データ取得
  useEffect(() => {
    fetchSharedCalendars();
  }, []);

  useEffect(() => {
    if (selectedCalendarId) fetchSchedules(selectedCalendarId);
  }, [selectedCalendarId]);

  const fetchSharedCalendars = async () => {
    // GET API がある場合はここで取得
    // 省略
  };

  const fetchSchedules = async (calendarId) => {
    try {
      const res = await axios.get(`${API_URL}/shared-calendars/${calendarId}/schedules`);
      setSchedules(res.data);
    } catch (error) {
      alert('スケジュール取得に失敗しました');
    }
  };

  const createUser = async () => {
    try {
      const res = await axios.post(`${API_URL}/users`, { name: newUserName });
      alert(`ユーザー作成: ${res.data.name} (ID: ${res.data.id})`);
      setUsers([...users, res.data]);
      setNewUserName('');
    } catch {
      alert('ユーザー作成失敗');
    }
  };

  const createSharedCalendar = async () => {
    try {
      const res = await axios.post(`${API_URL}/shared-calendars`, {
        name: newCalendarName,
        description: newCalendarDesc,
      });
      alert(`共有カレンダー作成: ${res.data.name} (ID: ${res.data.id})`);
      setSharedCalendars([...sharedCalendars, res.data]);
      setNewCalendarName('');
      setNewCalendarDesc('');
      setSelectedCalendarId(res.data.id);
    } catch {
      alert('共有カレンダー作成失敗');
    }
  };

  const createSchedule = async () => {
    if (!newSchedule.start_time || !newSchedule.end_time) {
      // タイプに応じて時間自動設定
      let start, end;
      if (newSchedule.type === '全日') {
        start = '10:00';
        end = '00:00';
      } else if (newSchedule.type === '昼') {
        start = '13:00';
        end = '19:00';
      } else if (newSchedule.type === '夜') {
        start = '21:00';
        end = '00:00';
      }
      const today = new Date().toISOString().split('T')[0];
      newSchedule.start_time = `${today}T${start}`;
      newSchedule.end_time = `${today}T${end}`;
    }

    try {
      await axios.post(`${API_URL}/personal-schedules`, newSchedule);
      alert('スケジュール作成成功');
      fetchSchedules(newSchedule.shared_calendar_id);
      setNewSchedule({
        user_id: '',
        shared_calendar_id: selectedCalendarId,
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        type: '全日'
      });
    } catch {
      alert('スケジュール作成失敗');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>共有カレンダー</h1>

      <section>
        <h2>ユーザー作成</h2>
        <input
          placeholder="ユーザー名"
          value={newUserName}
          onChange={e => setNewUserName(e.target.value)}
        />
        <button onClick={createUser}>作成</button>
      </section>

      <section>
        <h2>共有カレンダー作成</h2>
        <input
          placeholder="カレンダー名"
          value={newCalendarName}
          onChange={e => setNewCalendarName(e.target.value)}
        />
        <input
          placeholder="説明"
          value={newCalendarDesc}
          onChange={e => setNewCalendarDesc(e.target.value)}
        />
        <button onClick={createSharedCalendar}>作成</button>
      </section>

      <section>
        <h2>共有カレンダー選択</h2>
        <select onChange={e => setSelectedCalendarId(e.target.value)} value={selectedCalendarId || ''}>
          <option value="" disabled>選択してください</option>
          {sharedCalendars.map(sc => (
            <option key={sc.id} value={sc.id}>{sc.name}</option>
          ))}
        </select>
      </section>

      {selectedCalendarId && (
        <>
          <section>
            <h2>個人スケジュール作成</h2>
            <select
              value={newSchedule.user_id}
              onChange={e => setNewSchedule({ ...newSchedule, user_id: e.target.value })}
            >
              <option value="">ユーザー選択</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>

            <input
              placeholder="タイトル"
              value={newSchedule.title}
              onChange={e => setNewSchedule({ ...newSchedule, title: e.target.value })}
            />
            <input
              placeholder="説明"
              value={newSchedule.description}
              onChange={e => setNewSchedule({ ...newSchedule, description: e.target.value })}
            />

            <select
              value={newSchedule.type}
              onChange={e => setNewSchedule({ ...newSchedule, type: e.target.value })}
            >
              <option value="全日">全日 (10:00〜0:00)</option>
              <option value="昼">昼 (13:00〜19:00)</option>
              <option value="夜">夜 (21:00〜0:00)</option>
            </select>

            <button onClick={createSchedule}>スケジュール作成</button>
          </section>

          <section>
            <h2>スケジュール一覧</h2>
            <ul>
              {schedules.map(s => (
                <li key={s.id}>
                  {s.title} - {s.user_name} ({new Date(s.start_time).toLocaleString()} ～ {new Date(s.end_time).toLocaleString()})
                  <br />
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
