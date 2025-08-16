import React, { useEffect, useMemo, useState } from 'react'
import UniversalCalendar from '../components/UniversalCalendar.jsx'
function addDays(iso,n){const dt=new Date(iso+'T00:00:00');dt.setDate(dt.getDate()+n);const y=dt.getFullYear();const m=String(dt.getMonth()+1).padStart(2,'0');const d=String(dt.getDate()).padStart(2,'0');return `${y}-${m}-${d}`}
const rangeDates=(s,e)=>{const out=[];let cur=s;const end=e||s;while(cur<=end){out.push(cur);cur=addDays(cur,1)}return out}
export default function Shared(){
  const [items,setItems]=useState([]),[title,setTitle]=useState(''),[timeSlot,setTimeSlot]=useState('全日'),[userShareURL,setUserShareURL]=useState('')
  const t=new Date();const [y,setY]=useState(t.getFullYear());const [m,setM]=useState(t.getMonth()+1);const today=new Date().toISOString().slice(0,10);const [selected,setSelected]=useState([today])
  const fetchData=async()=>{const r=await fetch('/api/shared');if(r.ok)setItems(await r.json())};useEffect(()=>{fetchData();(async()=>{const r=await fetch('/api/share/user');if(r.ok){const d=await r.json();setUserShareURL(d.url)}})()},[])
  const map=useMemo(()=>{const mp={};for(const ev of items){(mp[ev.date] ||= []).push(ev)}return mp},[items])
  const add=async(e)=>{e.preventDefault();const dates=rangeDates(range.start,range.end);for(const d of dates){await fetch('/api/shared',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,date:d,time_slot:timeSlot})})}setTitle('');setTimeSlot('全日');fetchData()}
  const del=async(id)=>{await fetch('/api/shared/'+id,{method:'DELETE'});fetchData()}
  const prev=()=>{const nm=m-1;if(nm<1){setM(12);setY(y-1)}else setM(nm)};const next=()=>{const nm=m+1;if(nm>12){setM(1);setY(y+1)}else setM(nm)}
  const renderDay=(iso)=>{if(!iso)return '';const day=Number(iso.slice(-2));const list=map[iso]||[];return(<div style={{display:'grid',gridTemplateRows:'auto auto',placeItems:'center',gap:4}}><div style={{fontWeight:700}}>{day}</div><div style={{display:'inline-flex',gap:4}}>{list.slice(0,3).map((ev,i)=>(<span key={ev.id||i} className="badge" title={`${ev.title} [${ev.time_slot}]`} style={{background:ev.time_slot==='全日'?'#22d3ee':ev.time_slot==='昼'?'#34d399':'#f472b6'}} />))}{list.length>3&&<span style={{fontSize:10,color:'#9aa0b4'}}>+{list.length-3}</span>}</div></div>)}
  const copy=()=>{navigator.clipboard.writeText(userShareURL)}
  return(<section className="card"><h2>共有スケジュール</h2>
    <div className="item">あなたの共有URL: {userShareURL? <a className="link" href={userShareURL} target="_blank" rel="noreferrer">{userShareURL}</a> : '生成中...'}
      {userShareURL && <button className="button ghost" onClick={copy}>コピー</button>}
    </div>
    <div className="row" style={{alignItems:'flex-start'}}>
      <div style={{flex:'0 0 420px'}}>
        <UniversalCalendar mode="multi" year={y} month={m} selectedDates={selected} onMultiChange={setSelected} onPrev={prev} onNext={next} renderDay={renderDay}/>
        <div className="row" style={{marginTop:8}}><button className="button ghost" onClick={()=> setSelected([today])}>今日</button><button className="button ghost" onClick={()=> setSelected([])}>単日</button></div>
      </div>
      <form onSubmit={add} className="card" style={{flex:'1 1 420px'}}>
        <div className="grid-form">
          <label>タイトル</label>
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} required />
          <label>時間帯</label>
          <select className="select" value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}><>{[...Array(24)].map((_,h)=>{const hh=String(h).padStart(2,'0')+':00';return <option key={hh} value={hh}>{hh}</option>})}</></select>
          <div className="full row" style={{marginTop:10}}><button className="button" type="submit">追加（選択範囲）</button></div>
        </div>
      </form>
    </div>
    <h3 style={{marginTop:16}}>一覧</h3>
    <ul className="list">{items.map(it=>(<li key={it.id} className="item"><strong>{it.date}</strong> [{it.time_slot}] — {it.title}<button className="button ghost" onClick={()=>del(it.id)}>削除</button></li>))}</ul>
  </section>) }