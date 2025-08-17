import React, { useState } from 'react';

export default function CustomCalendar(){
  const [selected,setSelected] = useState(new Date().toISOString().split('T')[0]);
  return (
    <div className="calendar">
      <input type="date" value={selected} onChange={e=>setSelected(e.target.value)} />
      <div>選択日: {selected}</div>
    </div>
  );
}
