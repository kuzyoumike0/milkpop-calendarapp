import React, { useMemo } from 'react';

/**
 * MiniCalendar (range mode)
 * - Show a month grid
 * - Click once: set rangeStart
 * - Click later: if date >= start -> set rangeEnd, else move start
 * - If both start/end already set -> restart range from clicked day
 */
export default function MiniCalendar({
  year, month,
  rangeStart, rangeEnd,
  onRangeChange,
  onPrev, onNext
}) {
  const weeks = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const firstDay = first.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i=0; i<firstDay; i++) cells.push(null);
    for (let d=1; d<=daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const out = [];
    for (let i=0; i<cells.length; i+=7) out.push(cells.slice(i, i+7));
    return out;
  }, [year, month]);

  const iso = (d) => {
    const mm = String(month).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };
  const todayIso = new Date().toISOString().slice(0,10);

  const inRange = (v) => {
    if (!rangeStart) return false;
    if (!rangeEnd) return v === rangeStart;
    return v >= rangeStart && v <= rangeEnd;
  };

  const isStart = (v) => rangeStart && v === rangeStart;
  const isEnd   = (v) => rangeEnd && v === rangeEnd;

  const clickDay = (v) => {
    if (!onRangeChange) return;
    if (!rangeStart || (rangeStart && rangeEnd)) {
      onRangeChange({ start: v, end: null });
    } else {
      if (v < rangeStart) onRangeChange({ start: v, end: null });
      else onRangeChange({ start: rangeStart, end: v });
    }
  };

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
          const blank = d===null;
          const v = !blank ? iso(d) : null;
          const selected = !blank && inRange(v);
          const start = !blank && isStart(v);
          const end = !blank && isEnd(v);
          const today = !blank && todayIso === v;

          const bg = selected
            ? 'linear-gradient(90deg, var(--brand), var(--brand2))'
            : 'rgba(255,255,255,.04)';
          const color = selected ? '#0f1020' : 'var(--txt)';
          const border = today ? '1px solid var(--accent)' : '1px solid var(--border)';
          const ring = start || end ? '0 0 0 3px rgba(34,211,238,.3)' : 'none';

          return (
            <button
              key={idx}
              className="button"
              disabled={blank}
              onClick={()=> !blank && clickDay(v)}
              style={{
                height:42, borderRadius:12, padding:0,
                opacity: blank ? 0 : 1,
                background: bg, color, border,
                boxShadow: ring
              }}
              title={v || ''}
            >
              {!blank ? d : ''}
            </button>
          );
        })}
      </div>
      <div style={{marginTop:10, color:'#9aa0b4', fontSize:12}}>
        範囲: {rangeStart || '—'} {rangeEnd ? `〜 ${rangeEnd}` : ''}
      </div>
    </div>
  );
}
