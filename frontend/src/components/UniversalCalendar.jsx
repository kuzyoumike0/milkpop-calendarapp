import React, { useMemo } from 'react'
const pad=n=>String(n).padStart(2,'0');const iso=(y,m,d)=>`${y}-${pad(m)}-${pad(d)}`
export default function UniversalCalendar({mode='single',year,month,value,onChange,range,onRangeChange,onPrev,onNext,renderDay,selectedDates,onMultiChange}){
  const today=new Date().toISOString().slice(0,10)
  const weeks=useMemo(()=>{const first=new Date(year,month-1,1),fd=first.getDay(),dim=new Date(year,month,0).getDate();const cells=[];for(let i=0;i<fd;i++)cells.push(null);for(let d=1;d<=dim;d++)cells.push(d);while(cells.length%7!==0)cells.push(null);const out=[];for(let i=0;i<cells.length;i+=7)out.push(cells.slice(i,i+7));return out},[year,month])
  const click=(d)=>{
    if(!d) return;
    const v=iso(year,month,d);
    if(mode==='single'&&onChange){ onChange(v); return; }
    if(mode==='range'&&onRangeChange){
      const s=range?.start||null,e=range?.end||null;
      if(!s||(s&&e)) onRangeChange({start:v,end:null});
      else if(v<s) onRangeChange({start:v,end:null});
      else onRangeChange({start:s,end:v});
      return;
    }
    if(mode==='multi'&&onMultiChange){
      const set=new Set(selectedDates||[]);
      if(set.has(v)) set.delete(v); else set.add(v);
      onMultiChange(Array.from(set).sort());
      return;
    }
  });else if(v<s)onRangeChange({start:v,end:null});else onRangeChange({start:s,end:v})}}
  return(<div className="card" style={{padding:16}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <button className="button ghost" onClick={onPrev}>←</button>
      <div style={{fontWeight:700}}>{year}年 {month}月</div>
      <button className="button ghost" onClick={onNext}>→</button>
    </div>
    <div className="small" style={{marginBottom:6}}>範囲選択: 最初のクリックで開始日、次のクリックで終了日（同日で単日）。</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>
      {['日','月','火','水','木','金','土'].map((w,i)=>(<div key={i} style={{textAlign:'center',color:'#9aa0b4',fontWeight:600}}>{w}</div>))}
      {weeks.flat().map((d,i)=>{
        const blank=d===null; const v=!blank?iso(year,month,d):null;
        const selected=(mode==='single'&&value===v)||(mode==='range'&&v&&range&&(range.end?(v>=range.start&&v<=range.end):v===range.start))||(mode==='multi'&&v&&(selectedDates||[]).includes(v));
        const isToday=v===today; const bg=selected?'linear-gradient(90deg,var(--brand),var(--brand2))':'rgba(255,255,255,.04)';
        const color=selected?'#0f1020':'var(--txt)'; const border=isToday?'1px solid var(--accent)':'1px solid var(--border)';
        return(<button key={i} className="button" disabled={blank} style={{height:64,borderRadius:12,padding:0,background:bg,color,border,opacity:blank?0:1,display:'grid',placeItems:'center'}} onClick={()=>click(d)} title={v||''}>{!blank?d:''}</button>)
      })}
    </div>
  </div>) }