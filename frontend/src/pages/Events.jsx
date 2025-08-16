import React, { useEffect, useState } from 'react'
export default function Events(){
  const [items,setItems]=useState([]),[title,setTitle]=useState(''),[date,setDate]=useState('')
  const fetchData=async()=>{const r=await fetch('/api/events');if(r.ok)setItems(await r.json())};useEffect(()=>{fetchData() },[])
  const add=async(e)=>{e.preventDefault();await fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,date})});setTitle('');setDate('');fetchData()}
  const del=async(id)=>{await fetch('/api/events/'+id,{method:'DELETE'});fetchData()}
  return(<section className="card"><h2>イベント</h2><form onSubmit={add} className="row" style={{alignItems:'center'}}><input className="input" placeholder="イベント名" value={title} onChange={e=>setTitle(e.target.value)} required /><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} required /><button className="button">追加</button></form><ul className="list" style={{marginTop:12}}>{items.map(it=>(<li key={it.id} className="item"><strong>{it.date}</strong> — {it.title}<button className="button ghost" onClick={()=>del(it.id)}>削除</button></li>))}</ul></section>) }