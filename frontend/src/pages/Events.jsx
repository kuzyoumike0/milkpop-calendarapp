import React, { useEffect, useState } from 'react';
import { addEvent, listEvents } from '../api';

export default function Events() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const fetchData = async () => {
    const res = await listEvents();
    setItems(res.data);
  };

  useEffect(() => { fetchData(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    await addEvent({ title, date });
    setTitle(''); setDate('');
    fetchData();
  };

  return (
    <section className="card">
      <h2>イベント一覧</h2>
      <form onSubmit={onSubmit} className="row" style={{alignItems:'center'}}>
        <input className="input" placeholder="イベント名" value={title} onChange={e=>setTitle(e.target.value)} required />
        <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} required />
        <button className="button" type="submit">登録</button>
      </form>
      <ul className="list" style={{marginTop:12}}>
        {items.map(it => (
          <li key={it.id} className="item">{it.date} - {it.title}</li>
        ))}
      </ul>
    </section>
  );
}
