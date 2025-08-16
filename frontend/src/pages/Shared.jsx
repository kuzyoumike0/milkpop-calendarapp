import React, { useEffect, useMemo, useState } from 'react'
import UniversalCalendar from '../components/UniversalCalendar.jsx'
export default function Shared(){
  const [items,setItems]=useState([]),[title,setTitle]=useState(''),[timeSlot,setTimeSlot]=useState('01:00'),[memberNames,setMemberNames]=useState('')
  const [startHour,setStartHour]=useState('09:00');
  const [endHour,setEndHour]=useState('18:00');
  const [mode,setMode]=useState('multi');
  const [range,setRange]=useState({start:null,end:null});
  const [personalDates,setPersonalDates]=useState([]);
  const t=new Date();const [y,setY]=useState(t.getFullYear());const [m,setM]=useState(t.getMonth()+1);const today=new Date().toISOString().slice(0,10);const [selected,setSelected]=useState([today])
  const fetchData=async()=>{const r=await fetch('/api/shared');if(r.ok)setItems(await r.json())};
  useEffect(()=>{fetchData();(async()=>{const r=await fetch('/api/share/user');if(r.ok){const d=await r.json();setUserShareURL(d.url)}})();(async()=>{const r=await fetch('/api/personal');if(r.ok){const ps=await r.json();setPersonalDates(Array.from(new Set(ps.map(x=>x.date))))}})()},[])
  const [userShareURL,setUserShareURL]=useState('')
  const map=useMemo(()=>{const mp={};for(const ev of items){(mp[ev.date] ||= []).push(ev)}return mp},[items])
  const add=async(e)=>{
    e.preventDefault();
    const dates = selected.length? selected : [today];
    const names = memberNames.split(/[，,\n]/).map(s=>s.trim()).filter(Boolean);
    const loopNames = names.length ? names : ['自分'];
    for (const d of dates) {
      for (const nm of loopNames) {
        await fetch('/api/shared',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,date:d,time_slot:timeSlot,member_name:nm})})
      }
    }
    setTitle('');setMemberNames('');setTimeSlot('01:00');setSelected([today]);fetchData()
  }
  const del=async(id)=>{await fetch('/api/shared/'+id,{method:'DELETE'});fetchData()}
  const prev=()=>{const nm=m-1;if(nm<1){setM(12);setY(y-1)}else setM(nm)};const next=()=>{const nm=m+1;if(nm>12){setM(1);setY(y+1)}else setM(nm)}
  const renderDay=(iso)=>{if(!iso)return '';const day=Number(iso.slice(-2));const list=map[iso]||[];return(<div style={{display:'grid',gridTemplateRows:'auto auto',placeItems:'center',gap:4}}><div style={{fontWeight:700}}>{day}</div><div style={{display:'inline-flex',gap:4}}>{list.slice(0,3).map((ev,i)=>(<span key={ev.id||i} className="badge" title={`${ev.title} [${ev.time_slot}]`} style={{background:'#22d3ee'}} />))}{list.length>3&&<span style={{fontSize:10,color:'#9aa0b4'}}>+{list.length-3}</span>}</div></div>)}
  const createSession=async()=>{const dates = mode==='range' ? (range.start?[range.start, range.end||range.start]:[]) : selected; if(!dates.length){alert('日付を選択してください'); return;} const r=await fetch('/api/shared/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dates,mode,title,start_time:startHour,end_time:endHour})}); if(r.ok){ const d=await r.json(); setUserShareURL(d.url); navigator.clipboard.writeText(d.url); alert('共有リンクをコピーしました'); }}
  const hourOptions=[...Array(23)].map((_,i)=>`${String(i+1).padStart(2,'0')}:00`).concat(['00:00'])
  return(<section className="card"><h2>共有スケジュール</h2>
    <div className="item">あなたの共有URL: {userShareURL? <a className="link" href={userShareURL} target="_blank" rel="noreferrer">{userShareURL}</a> : '生成中...'}
      {userShareURL && <button className="button ghost" onClick={()=>navigator.clipboard.writeText(userShareURL)}>コピー</button>}
    </div>
    <div className="row" style={{alignItems:'flex-start'}}>
      <div style={{flex:'0 0 420px'}}>
        <div className="row" style={{marginBottom:8}}>        <label style={{display:'flex',alignItems:'center',gap:8}}><input type="radio" name="mode" checked={mode==='multi'} onChange={()=>setMode('multi')} /> 複数選択</label>        <label style={{display:'flex',alignItems:'center',gap:8}}><input type="radio" name="mode" checked={mode==='range'} onChange={()=>setMode('range')} /> 範囲選択</label>        </div>        {mode==='multi' ? (          <UniversalCalendar mode="multi" year={y} month={m} selectedDates={selected} onMultiChange={setSelected} onPrev={prev} onNext={next} renderDay={renderDay} disabledDates={personalDates} />        ) : (          <UniversalCalendar mode="range" year={y} month={m} range={range} onRangeChange={setRange} onPrev={prev} onNext={next} renderDay={renderDay} disabledDates={personalDates} />        )}
        <div className="grid-form" style={{marginTop:8}}>
  <label>タイトル</label><input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="例: 打合せ候補" />
  <label>開始</label><select className="select strong" value={startHour} onChange={e=>setStartHour(e.target.value)}>{hourOptions.map(h=><option key={h} value={h}>{h}</option>)}</select>
  <label>終了</label><select className="select strong" value={endHour} onChange={e=>setEndHour(e.target.value)}>{hourOptions.map(h=><option key={h} value={h}>{h}</option>)}</select>
  <div className="full row" style={{gap:8}}>
    <button className="button ghost" onClick={()=> setSelected([today])}>今日</button>
    <button className="button ghost" onClick={()=> setSelected([])}>選択クリア</button>
    <button className="button" onClick={createSession}>共有リンク発行</button>
  </div>
</div>
      </div>
      <form onSubmit={add} className="card" style={{flex:'1 1 420px'}}>
        <div className="grid-form">
          <label>タイトル</label>
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} required />
          <label>ユーザー名(カンマ区切り)</label>
          <input className="input" placeholder="例: 田中,佐藤,Alex" value={memberNames} onChange={e=>setMemberNames(e.target.value)} />
          <label>時間帯</label>
          <select className="select strong" value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}>
            {hourOptions.map(h=><option key={h} value={h}>{h}</option>)}
          </select>
          <div className="full row" style={{marginTop:10}}><button className="button" type="submit">追加（選択日×名前）</button></div>
        </div>
      </form>
    </div>
    <h3 style={{marginTop:16}}>一覧</h3>
    {Object.entries(items.reduce((acc,it)=>{(acc[it.date] ||= []).push(it);return acc;},{}))
      .sort(([a],[b])=>a.localeCompare(b))
      .map(([date,arr])=> (
        <div key={date} className="card" style={{marginTop:8}}>
          <h4 style={{margin:0}}>{date}</h4>
          <ul className="list">
            {arr.sort((a,b)=>String(a.time_slot).localeCompare(String(b.time_slot))).map(it=>(
              <li key={it.id} className="item">
                <span style={{minWidth:90,display:'inline-block'}}>{it.time_slot}</span>
                <span style={{minWidth:120,display:'inline-block',color:'#9aa0b4'}}>{it.member_name || '自分'}</span>
                <span style={{flex:1}}>{it.title}</span>
                <button className="button ghost" onClick={()=>del(it.id)}>削除</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
  </section>) }