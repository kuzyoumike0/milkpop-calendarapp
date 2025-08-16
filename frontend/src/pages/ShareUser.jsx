import React, { useEffect, useState } from 'react'
export default function ShareUser({ token }){
  const [items,setItems]=useState(null),[error,setError]=useState('')
  useEffect(()=>{(async()=>{try{const r=await fetch('/api/share/user/'+token);if(!r.ok){setError('リンクが無効です');return}setItems(await r.json())}catch{setError('読み込みに失敗しました')}})()},[token])
  if(error){return <div className="container" style={{display:'grid',placeItems:'center'}}><div className="card" style={{maxWidth:520}}><h2>共有リンク</h2><p style={{color:'#f59e0b'}}>{error}</p></div></div>}
  if(!items) return null
  return(<div className="container" style={{display:'grid',placeItems:'center'}}><div className="card" style={{maxWidth:820,width:'92%'}}><h2>共有スケジュール</h2>
    {Object.entries(items.reduce((acc,it)=>{(acc[it.date] ||= []).push(it);return acc;},{}))
      .sort(([a],[b])=>a.localeCompare(b))
      .map(([date,arr])=>(
        <div key={date} className="card" style={{marginTop:8}}>
          <h4 style={{margin:0}}>{date}</h4>
          <ul className="list">
            {arr.sort((a,b)=>String(a.time_slot).localeCompare(String(b.time_slot))).map(it=>(
              <li key={it.id} className="item">
                <span style={{minWidth:90,display:'inline-block'}}>{it.time_slot}</span>
                <span style={{minWidth:120,display:'inline-block',color:'#9aa0b4'}}>{it.member_name || '—'}</span>
                <span style={{flex:1}}>{it.title}</span>
              </li>
            ))}
          </ul>
        </div>
    ))}
  </div></div>) }