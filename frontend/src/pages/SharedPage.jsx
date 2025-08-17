import React, { useState } from 'react';
import CustomCalendar from '../components/CustomCalendar';

export default function SharedPage() {
  const [link,setLink] = useState(null);
  const [title,setTitle] = useState("");

  async function generateLink(){
    const res = await fetch('/api/share',{method:'POST'});
    const data = await res.json();
    setLink(data.url);
  }

  return (
    <div className="page">
      <h2>共有スケジュール作成</h2>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="タイトル" />
      <CustomCalendar />
      <button onClick={generateLink}>共有リンクを発行</button>
      {link && <p><a href={link}>{window.location.origin+link}</a></p>}
    </div>
  );
}
