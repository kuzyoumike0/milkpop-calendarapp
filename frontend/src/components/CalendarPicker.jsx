import React from "react";

function toKey(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function daysInMonth(year, month){ // month: 0-11
  return new Date(year, month+1, 0).getDate();
}

/**
 * Props:
 *  - value: Set<string> (YYYY-MM-DD)
 *  - onChange: (Set<string>) => void
 *  - initialMonth?: Date
 */
export default function CalendarPicker({ value, onChange, initialMonth, highlightColor = '#22d3ee' }){
  const [view, setView] = React.useState(initialMonth || new Date());
  const [dragging, setDragging] = React.useState(null); // start date key if range dragging

  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const startWeekday = first.getDay(); // 0 Sun - 6 Sat
  const total = daysInMonth(view.getFullYear(), view.getMonth());
  const days = [...Array(total)].map((_,i)=> new Date(view.getFullYear(), view.getMonth(), i+1));

  const prevMonth = ()=> setView(new Date(view.getFullYear(), view.getMonth()-1, 1));
  const nextMonth = ()=> setView(new Date(view.getFullYear(), view.getMonth()+1, 1));

  const toggle = (k)=>{
    const next = new Set(value);
    if(next.has(k)) next.delete(k);
    else next.add(k);
    onChange(next);
  };

  const onMouseDown = (k)=>{
    setDragging(k);
    const next = new Set(value);
    if(!next.has(k)) next.add(k);
    onChange(next);
  };

  const onMouseEnter = (k)=>{
    if(!dragging) return;
    // select range from dragging to k
    const from = new Date(dragging);
    const to = new Date(k);
    const [s, e] = from <= to ? [from, to] : [to, from];
    const cur = new Set();
    const d = new Date(s);
    while(d <= e){
      cur.add(toKey(d));
      d.setDate(d.getDate()+1);
    }
    // merge with existing without clearing previous? For range selection UX, replace range selection on drag.
    onChange(cur);
  };

  const onMouseUp = ()=> setDragging(null);

  React.useEffect(()=>{
    const up = ()=> setDragging(null);
    window.addEventListener('mouseup', up);
    return ()=> window.removeEventListener('mouseup', up);
  },[]);

  const weekLabels = ["日","月","火","水","木","金","土"];
  function hexToRgba(hex, alpha){
    try{
      const h = hex.replace('#','');
      const bigint = parseInt(h.length===3 ? h.split('').map(x=>x+x).join('') : h, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }catch(e){ return 'rgba(34,211,238,' + alpha + ')'; }
  }


  return (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
        <button type="button" className="btn btn-secondary" onClick={prevMonth}>‹</button>
        <div style={{fontWeight:800}}>{view.getFullYear()}年 {view.getMonth()+1}月</div>
        <button type="button" className="btn btn-secondary" onClick={nextMonth}>›</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6, userSelect:'none'}} onMouseLeave={onMouseUp}>
        {weekLabels.map(w=> <div key={w} style={{textAlign:'center', color:'#9ca3af', fontSize:12}}>{w}</div>)}
        {Array.from({length:startWeekday}).map((_,i)=> <div key={'pad'+i} />)}
        {days.map(d=>{
          const k = toKey(d);
          const selected = value.has(k);
          return (
            <div
              key={k}
              onMouseDown={()=> onMouseDown(k)}
              onMouseEnter={()=> onMouseEnter(k)}
              onMouseUp={onMouseUp}
              onClick={()=> toggle(k)}
              style={{
                aspectRatio:'1/1', display:'grid', placeItems:'center', borderRadius:12,
                border: selected ? `2px solid ${highlightColor}` : '1px solid #1f2937',
                background: selected ? hexToRgba(highlightColor, .15) : '#0b1220',
                cursor:'pointer'
              }}
              title={k}
            >
              {d.getDate()}
            </div>
          );
        })}
      </div>
      <div className="note" style={{marginTop:8}}>クリックで日付を選択、ドラッグで範囲選択、もう一度クリックで解除できます。</div>
    </div>
  )
}