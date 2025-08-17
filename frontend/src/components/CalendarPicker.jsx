import React from "react";

function toKey(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function fromKey(k){
  const [y,m,d] = k.split("-").map(Number);
  return new Date(y, m-1, d);
}
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
 * CalendarPicker
 * Props:
 *  - value: Set<string> (YYYY-MM-DD)
 *  - onChange: (Set<string>) => void
 *  - initialMonth?: Date (default: today)
 *  - highlightColor?: string (hex)
 *  - mode?: 'multi' | 'range'  // how selection behaves
 *  - size?: 'sm' | 'md'        // compact sizing
 */
export default function CalendarPicker({
  value,
  onChange,
  initialMonth,
  highlightColor = '#22d3ee',
  mode = 'multi',
  size = 'sm',
}){
  const today = new Date();
  const [view, setView] = React.useState(initialMonth || today);
  const [dragAnchor, setDragAnchor] = React.useState(null); // key or null (for range)
  const [hoverKey, setHoverKey] = React.useState(null);

  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const startWeekday = first.getDay();
  const total = daysInMonth(view.getFullYear(), view.getMonth());
  const days = [...Array(total)].map((_,i)=> new Date(view.getFullYear(), view.getMonth(), i+1));

  const prevMonth = ()=> setView(new Date(view.getFullYear(), view.getMonth()-1, 1));
  const nextMonth = ()=> setView(new Date(view.getFullYear(), view.getMonth()+1, 1));

  const cellSize = size==='sm' ? 36 : 44; // smaller than before
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
    }else{ // multi
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
  const handleMouseUp = ()=>{
    setDragAnchor(null);
  };

  React.useEffect(()=>{
    const up = ()=> setDragAnchor(null);
    window.addEventListener('mouseup', up);
    return ()=> window.removeEventListener('mouseup', up);
  },[]);

  const weekLabels = ["日","月","火","水","木","金","土"];
  const borderSel = (c)=> `2px solid ${highlightColor}`;
  const bgSel = (c)=> hexToRgba(highlightColor, .18);

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
        <button type="button" className="btn btn-secondary" onClick={prevMonth} aria-label="前の月">‹</button>
        <div style={{fontWeight:800}}>{view.getFullYear()}年 {view.getMonth()+1}月</div>
        <button type="button" className="btn btn-secondary" onClick={nextMonth} aria-label="次の月">›</button>
      </div>
      <div
        style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:gap, userSelect:'none'}}
        onMouseLeave={handleMouseUp}
      >
        {weekLabels.map(w=> <div key={w} style={{textAlign:'center', color:'#9ca3af', fontSize:12}}>{w}</div>)}
        {Array.from({length:startWeekday}).map((_,i)=> <div key={'pad'+i} />)}
        {days.map(d=>{
          const k = toKey(d);
          const selected = value.has(k);
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
                display:'grid', placeItems:'center', borderRadius:10,
                border: selected ? borderSel(highlightColor) : '1px solid #1f2937',
                background: selected ? bgSel(highlightColor) : '#0b1220',
                cursor:'pointer', fontSize: cellFont
              }}
              title={k}
            >
              {d.getDate()}
            </div>
          );
        })}
      </div>
      <div className="note" style={{marginTop:8}}>
        {mode==='range'
          ? "ドラッグまたはShiftで範囲選択／クリックで開始・終了を指定"
          : "クリックで複数選択／もう一度クリックで解除"}
      </div>
    </div>
  )
}
