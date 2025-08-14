import { useState, useEffect } from 'react';
import axios from 'axios';

function Calendar() {
  const [personal, setPersonal] = useState([]);
  const [shared, setShared] = useState([]);

  // ページロード時にAPI取得
  useEffect(() => {
    axios.get('/api/personal')
      .then(res => setPersonal(res.data))
      .catch(err => console.error(err));

    axios.get('/api/shared')
      .then(res => setShared(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>個人カレンダー</h2>
      <ul>
        {personal.map(event => (
          <li key={event.id}>{event.date} {event.time_slot} {event.title}</li>
        ))}
      </ul>

      <h2>共有カレンダー</h2>
      <ul>
        {shared.map(event => (
          <li key={event.id}>{event.date} {event.time_slot} {event.title} 作成者: {event.created_by}</li>
        ))}
      </ul>
    </div>
  );
}

export default Calendar;
