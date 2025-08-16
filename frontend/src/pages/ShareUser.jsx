import React, { useEffect, useState } from 'react'
export default function ShareUser({ token }){
  const [items,setItems]=useState(null),[error,setError]=useState('')
  useEffect(()=>{(async()=>{try{const r=await fetch('/api/share/user/'+token);if(!r.ok){setError('リンクが無効です');return}setItems(await r.json())}catch{setError('読み込みに失敗しました')}})()},[token])
  if(error){return <div className="container" style={{display:'grid',placeItems:'center'}}><div className="card" style={{maxWidth:520}}><h2>共有リンク</h2><p style={{color:'#f59e0b'}}>{error}</p></div></div>}
  if(!items) return null
  return(<div className="container" style={{display:'grid',placeItems:'center'}}><div className="card" style={{maxWidth:720,width:'92%'}}><h2>共有スケジュール</h2><ul className="list">{items.map(it=>(<li key={it.id} className="item"><strong>{it.date}</strong> [{it.time_slot}] — {it.title}</li>))}</ul></div></div>) }