import React from "react";

function toKey(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function fromKey(k){ const [y,m,d]=k.split('-').map(Number); return new Date(y, m-1, d); }
function daysInMonth(year, month){ return new Date(year, month+1, 0).getDate(); }

function hexToRgba(hex, alpha){
  try{
    const h = hex.replace('#','');
    const v = parseInt(h.length===3 ? h.split('').map(x=>x+x).join('') : h, 16);
    const r = (v>>16)&255, g=(v>>8)&255, b=v&255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }catch{ return `rgba(34,211,238,${alpha})`; }
}

/**
 * CalendarPicker (enhanced)
 * Props:
 *  - value: Set<string> YYYY-MM-DD
 *  - onChange: (Set<string>) => void
 *  - initialMonth?: Date (default: today)
 *  - highlightColor?: string (hex)
 *  - mode?: 'multi' | 'range' (default: 'multi')
 *  - size?: 'sm' | 'md' (default: 'sm')
 *  - variant?: 'flat' | 'card' (default: 'flat') // 'card' shows elevated background
 *  - showToday?: boolean (default: true)         // ring highlight today
 *  - weekendTint?: boolean (default: true)       // light tint for Sat/Sun
 */
export default function CalendarPicker({
  value,
  onChange,
  initialMonth,
  highlightColor = '#22d3ee',
  mode = 'multi',
  size = 'sm',
  variant = 'flat',
  showToday = true,
  weekendTint = true,
}){
  const today = new Date();
  const [view, setView] = React.useState(initialMonth || today);
  const [dragAnchor, setDragAnchor] = React.useState(null);
  const [hoverKey, setHoverKey] = React.useState(null);

  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const startWeekday = first.getDay();
  const total = daysInMonth(view.getFullYear(), view.getMonth());
  const days = [...Array(total)].map((_,i)=> new Date(view.getFullYear(), view.getMonth(), i+1));

  const prevMonth = ()=> setView(new Date(view.getFullYear(), view.getMonth()-1, 1));
  const nextMonth = ()=> setView(new Date(view.getFullYear(), view.getMonth()+1, 1));

  const cellSize = size==='sm' ? 36 : 42;
  const cellFont = size==='sm' ? 12 : 13;
  const gap = size==='sm' ? 6 : 8;

  const commitRange = (aKey, bKey)=>{
    const a = fromKey(aKey), b = fromKey(bKey);
    const [s,e] = a<=b ? [a,b] : [b,a];
    const cur = new Set();
    const d = new Date(s);
    while(d <= e){
      cur.add(toKey(d));
      d.setDate(d.getDate()+1);
    }
    onChange(cur);
  };

  const handleMouseDown = (k)=>{
    if(mode === 'range'){
      setDragAnchor(k);
      commitRange(k,k);
    }else{
      const next = new Set(value);
      if(next.has(k)) next.delete(k); else next.add(k);
      onChange(next);
    }
  };
  const handleMouseEnter = (k)=>{
    setHoverKey(k);
    if(mode === 'range' && dragAnchor){
      commitRange(dragAnchor, k);
    }
  };
  const handleMouseUp = ()=> setDragAnchor(null);

  React.useEffect(()=>{
    const up = ()=> setDragAnchor(null);
    window.addEventListener('mouseup', up);
    return ()=> window.removeEventListener('mouseup', up);
  },[]);

  const weekLabels = ["日","月","火","水","木","金","土"];
  const borderSel = `2px solid ${highlightColor}`;
  const bgSel = hexToRgba(highlightColor, .18);
  const bgHover = 'rgba(255,255,255,.04)';
  const ringToday = `0 0 0 2px ${hexToRgba(highlightColor, .35)} inset`;

  const containerStyle = variant==='card'
    ? {background:'linear-gradient(180deg,#0f1628,#0a1223)', border:'1px solid #1c2a47', borderRadius:14, padding:12, boxShadow:'0 12px 30px rgba(0,0,0,.35),0 2px 8px rgba(0,0,0,.25)'}
    : {};

  return (
    <div style={containerStyle}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
        <button type="button" className="btn btn-secondary" onClick={prevMonth} aria-label="前の月">‹</button>
        <div style={{display:'flex', alignItems:'center', gap:8, padding:'6px 10px', border:'1px solid #1c2a47', borderRadius:999}}>
          <div style={{fontWeight:800}}>{view.getFullYear()}年</div>
          <div style={{opacity:.8}}>{view.getMonth()+1}月</div>
        </div>
        <button type="button" className="btn btn-secondary" onClick={nextMonth} aria-label="次の月">›</button>
      </div>
      <div
        style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:gap, userSelect:'none'}}
        onMouseLeave={handleMouseUp}
      >
        {weekLabels.map((w, i)=> (
          <div key={w} style={{textAlign:'center', color:'#9ca3af', fontSize:12, opacity: i===0 || i===6 ? .9 : .8}}>{w}</div>
        ))}
        {Array.from({length:startWeekday}).map((_,i)=> <div key={'pad'+i} />)}
        {days.map(d=>{
          const k = toKey(d);
          const selected = value.has(k);
          const isToday = toKey(today) === k && showToday;
          const dow = d.getDay();
          const weekendBg = weekendTint && (dow===0 || dow===6) ? 'linear-gradient(180deg, rgba(96,165,250,.07), rgba(34,197,94,0) 60%)' : '#0b1220';
          return (
            <div
              key={k}
              onMouseDown={()=> handleMouseDown(k)}
              onMouseEnter={()=> handleMouseEnter(k)}
              onMouseUp={handleMouseUp}
              role="button"
              tabIndex={0}
              onKeyDown={(e)=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); handleMouseDown(k);} }}
              style={{
                height: cellSize, aspectRatio:'1/1',
                display:'grid', placeItems:'center', borderRadius:12,
                border: selected ? borderSel : '1px solid #1f2937',
                background: selected ? bgSel : weekendBg,
                cursor:'pointer', fontSize: cellFont,
                boxShadow: isToday ? ringToday : 'none'
              }}
              title={k}
              onFocus={()=> setHoverKey(k)}
              onBlur={()=> setHoverKey(null)}
              onMouseOver={()=>{}}
            >
              <div style={{opacity: selected ? 1 : .95}}>{d.getDate()}</div>
            </div>
          );
        })}
      </div>
    </div>
  )
}
