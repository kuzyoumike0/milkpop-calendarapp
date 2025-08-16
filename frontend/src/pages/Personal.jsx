import React, { useState, useEffect } from 'react';
import { addPersonal, listPersonal } from '../api';

export default function Personal() {
  const [user, setUser] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('全日');
  const [items, setItems] = useState([]);

  const fetchData = async () => {
    const res = await listPersonal();
    setItems(res.data);
  };
  useEffect(() => { fetchData(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    await addPersonal({ user, title, date, time_slot: timeSlot });
    setUser(''); setTitle(''); setDate(''); setTimeSlot('全日');
    fetchData();
  };

  return (
    <section className="card">
      <h2>個人スケジュール</h2>
      <form onSubmit={onSubmit} className="row" style={{alignItems:'center'}}>
        <input className="input" placeholder="ユーザー名" value={user} onChange={e=>setUser(e.target.value)} required />
        <input className="input" placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)} required />
        <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} required />
        <select className="select" value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}>
          <option>全日</option><option>昼</option><option>夜</option>
        </select>
        <button className="button" type="submit">追加</button>
      </form>
      <ul className="list" style={{marginTop:12}}>
        {items.map(it => (
          <li key={it.id} className="item">
            {it.date} [{it.time_slot}] {it.title} <span className="tag">{it.user}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
