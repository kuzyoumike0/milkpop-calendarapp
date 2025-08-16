import React, { useMemo } from 'react';

const pad = (n) => String(n).padStart(2, '0');
const isoOf = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

export default function UniversalCalendar({
  mode = 'single',
  year,
  month,
  onPrev,
  onNext,
  value,
  onChange,
  range,
  onRangeChange,
  renderDay,
  isDisabled,
}) {
  const todayIso = new Date().toISOString().slice(0, 10);

  const weeks = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const firstDay = first.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const out = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [year, month]);

  const clickDay = (iso) => {
    if (isDisabled?.(iso)) return;
    if (mode === 'single' && onChange) onChange(iso);
    if (mode === 'range' && onRangeChange){
      const s = range?.start || null;
      const e = range?.end || null;
      if (!s || (s && e)) onRangeChange({ start: iso, end: null });
      else if (iso < s) onRangeChange({ start: iso, end: null });
      else onRangeChange({ start: s, end: iso });
    }
  };

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <button className="button ghost" onClick={onPrev}>←</button>
        <div style={{ fontWeight: 700 }}>{year}年 {month}月</div>
        <button className="button ghost" onClick={onNext}>→</button>
      </div>

      <div className="table" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
        {['日','月','火','水','木','金','土'].map((w,i)=>(
          <div key={i} style={{ textAlign:'center', color:'#9aa0b4', fontWeight:600 }}>{w}</div>
        ))}

        {weeks.flat().map((d, idx) => {
          const blank = d === null;
          const iso = !blank ? isoOf(year, month, d) : null;
          const selected = (mode==='single' && value === iso) ||
                           (mode==='range' && (iso && range && ( (range.end? (iso>=range.start && iso<=range.end) : iso===range.start) )));
          const isToday = iso === todayIso;
          const disabled = blank || isDisabled?.(iso);

          const bg = selected
            ? 'linear-gradient(90deg, var(--brand), var(--brand2))'
            : 'rgba(255,255,255,.04)';
          const color = selected ? '#0f1020' : 'var(--txt)';
          const border = isToday ? '1px solid var(--accent)' : '1px solid var(--border)';
          const opacity = blank ? 0 : (disabled ? 0.45 : 1);

          return (
            <button
              key={idx}
              className="button"
              disabled={disabled}
              onClick={() => !blank && clickDay(iso)}
              style={{
                height: 48, borderRadius: 12, padding: 0,
                opacity, background: bg, color, border, position:'relative'
              }}
              title={iso || ''}
            >
              {renderDay ? renderDay(iso, { selected, isToday, disabled }) : (!blank ? d : '')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
