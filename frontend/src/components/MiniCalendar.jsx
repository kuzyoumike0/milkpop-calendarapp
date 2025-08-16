import React, { useMemo } from 'react';

/**
 * MiniCalendar
 * - month navigation (prev/next)
 * - select a single date (yyyy-mm-dd)
 */
export default function MiniCalendar({ year, month, value, onChange, onPrev, onNext }) {
  const weeks = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const firstDay = first.getDay(); // 0 Sun .. 6 Sat
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i=0; i<firstDay; i++) cells.push(null);
    for (let d=1; d<=daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const out = [];
    for (let i=0; i<cells.length; i+=7) out.push(cells.slice(i, i+7));
    return out;
  }, [year, month]);

  const fmt = (d) => {
    const mm = String(month).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const todayIso = new Date().toISOString().slice(0,10);

  return (
    <div className="card" style={{padding:16}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
        <button className="button ghost" onClick={onPrev}>←</button>
        <div style={{fontWeight:700}}>{year}年 {month}月</div>
        <button className="button ghost" onClick={onNext}>→</button>
      </div>
      <div className="table" style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6}}>
        {['日','月','火','水','木','金','土'].map((w,i)=>(
          <div key={i} style={{textAlign:'center', color:'#9aa0b4', fontWeight:600}}>{w}</div>
        ))}
        {weeks.flat().map((d, idx)=>{
          const isBlank = d === null;
          const iso = !isBlank ? fmt(d) : null;
          const isSelected = !isBlank && value === iso;
          const isToday = !isBlank && todayIso === iso;
          return (
            <button
              key={idx}
              className="button"
              disabled={isBlank}
              onClick={()=> onChange && onChange(iso)}
              style={{
                height:42, borderRadius:12, padding:0,
                opacity: isBlank ? 0 : 1,
                background: isSelected
                  ? 'linear-gradient(90deg, var(--brand), var(--brand2))'
                  : 'rgba(255,255,255,.04)',
                color: isSelected ? '#0f1020' : 'var(--txt)',
                border: isToday ? '1px solid var(--accent)' : '1px solid var(--border)',
              }}
            >
              {!isBlank ? d : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
