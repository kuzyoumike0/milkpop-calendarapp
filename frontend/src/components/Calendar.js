import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Calendar({ type }) {
  const [events, setEvents] = useState([]);
  const userId = 'user1'; // ダミー

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = type === 'shared' ? '/api/shared' : `/api/personal?user_id=${userId}`;
        const res = await axios.get(url);
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [type]);

  return (
    <div>
      <h2>{type === 'shared' ? '共有カレンダー' : '個人カレンダー'}</h2>
      {events.length === 0 ? <p>予定なし</p> :
        events.map(e => (
          <div key={e.id}>
            {e.time_slot}: {e.title} {type === 'shared' ? `(${e.created_by})` : ''}
          </div>
        ))
      }
    </div>
  );
}
