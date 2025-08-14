import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PersonalCalendar() {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [personal, setPersonal] = useState([]);
  const userId = 'user1'; // 本来はログインユーザーIDを使う

  const fetchPersonal = async () => {
    try {
      const res = await axios.get(`/api/personal?user_id=${userId}&date=${date}`);
      setPersonal(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPersonal();
    const interval = setInterval(fetchPersonal, 60000); // 1分ごと更新
    return () => clearInterval(interval);
  }, [date]);

  return (
    <div className="calendar-card">
      <h2>個人カレンダー</h2>
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
      {personal.length === 0 ? <p>予定なし</p> :
        personal.map(e => (
          <div key={e.id} className={`event ${e.time_slot}`}>
            <strong>{e.time_slot}</strong>: {e.title}
          </div>
        ))
      }
    </div>
  );
}
