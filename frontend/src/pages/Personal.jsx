import React, { useEffect, useMemo, useState } from 'react'
import UniversalCalendar from '../components/UniversalCalendar.jsx'
export default function Personal(){
  const [items,setItems]=useState([]),[title,setTitle]=useState(''),[memo,setMemo]=useState(''),[timeSlot,setTimeSlot]=useState('01:00'),[publish,setPublish]=useState(false)
  const t=new Date();const [y,setY]=useState(t.getFullYear());const [m,setM]=useState(t.getMonth()+1);const today=new Date().toISOString().slice(0,10);const [selected,setSelected]=useState([today])
  const fetchData=async()=>{const r=await fetch('/api/personal');if(r.ok)setItems(await r.json())};useEffect(()=>{fetchData()},[])
  const map=useMemo(()=>{const mp={};for(const ev of items){(mp[ev.date] ||= []).push(ev)}return mp},[items])
  const add=async(e)=>{
    e.preventDefault();
    const dates = selected.length? selected : [today];
    for (const d of dates) {
      await fetch('/api/personal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,memo,date:d,time_slot:timeSlot,publish_to_shared:publish})})
    }
    setTitle('');setMemo('');setTimeSlot('01:00');setPublish(false);setSelected([today]);fetchData()
  }
  const del=async(id)=>{await fetch('/api/personal/'+id,{method:'DELETE'});fetchData()}
  const prev=()=>{const nm=m-1;if(nm<1){setM(12);setY(y-1)}else setM(nm)};const next=()=>{const nm=m+1;if(nm>12){setM(1);setY(y+1)}else setM(nm)}
  const renderDay=(iso)=>{if(!iso)return '';const day=Number(iso.slice(-2));const list=map[iso]||[];return(<div style={{display:'grid',gridTemplateRows:'auto auto',placeItems:'center',gap:4}}><div style={{fontWeight:700}}>{day}</div><div style={{display:'inline-flex',gap:4}}>{list.slice(0,3).map((ev,i)=>(<span key={ev.id||i} className="badge" title={`${ev.title} [${ev.time_slot}]`} style={{background:'#34d399'}} />))}{list.length>3&&<span style={{fontSize:10,color:'#9aa0b4'}}>+{list.length-3}</span>}</div></div>)}
  const hourOptions=[...Array(23)].map((_,i)=>`${String(i+1).padStart(2,'0')}:00`).concat(['00:00'])
  return(<section className="card">
    <h2>個人スケジュール</h2>
    <div className="row" style={{alignItems:'flex-start'}}>
      <div style={{flex:'0 0 420px'}}>
        <UniversalCalendar mode="multi" year={y} month={m} selectedDates={selected} onMultiChange={setSelected} onPrev={prev} onNext={next} renderDay={renderDay} />
        <div className="row" style={{marginTop:8}}>
          <button className="button ghost" onClick={()=> setSelected([today])}>今日</button>
          <button className="button ghost" onClick={()=> setSelected([])}>選択クリア</button>
        </div>
      </div>
      <form onSubmit={add} className="card" style={{flex:'1 1 420px'}}>
        <div className="grid-form">
          <label>タイトル</label>
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} required />
          <label>メモ</label>
          <textarea rows="4" value={memo} onChange={e=>setMemo(e.target.value)} />
          <label>時間帯</label>
          <select className="select" value={timeSlot} onChange={e=>setTimeSlot(e.target.value)}>
            {hourOptions.map(h=><option key={h} value={h}>{h}</option>)}
          </select>
          <div className="full" style={{marginTop:6}}>
            <label style={{display:'flex',gap:8,alignItems:'center'}}>
              <input type="checkbox" checked={publish} onChange={e=>setPublish(e.target.checked)} />
              共有にも追加する
            </label>
          </div>
          <div className="full row" style={{marginTop:10}}>
            <button className="button" type="submit">追加（選択日すべて）</button>
          </div>
        </div>
      </form>
    </div>
    <h3 style={{marginTop:16}}>一覧</h3>
    <ul className="list">{items.map(it=>(
      <li key={it.id} className="item">
        <strong>{it.date}</strong> [{it.time_slot}] — {it.title}{it.memo? <span className="small" style={{marginLeft:8}}>（{it.memo}）</span> : null}
        <button className="button ghost" onClick={()=>del(it.id)}>削除</button>
      </li>
    ))}</ul>
  </section>) }