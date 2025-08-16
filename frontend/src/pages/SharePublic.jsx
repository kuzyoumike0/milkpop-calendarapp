import React, { useEffect, useState } from 'react'
export default function SharePublic({ token }){
  const [item,setItem]=useState(null),[error,setError]=useState('')
  useEffect(()=>{(async()=>{try{const r=await fetch('/api/share/'+token);if(!r.ok){setError('リンクが無効です');return}setItem(await r.json())}catch{setError('読み込みに失敗しました')}})()},[token])
  if(error){return <div className="container" style={{display:'grid',placeItems:'center'}}><div className="card" style={{maxWidth:520}}><h2>共有リンク</h2><p style={{color:'#f59e0b'}}>{error}</p></div></div>}
  if(!item) return null
  return(<div className="container" style={{display:'grid',placeItems:'center'}}><div className="card" style={{maxWidth:520}}><h2>共有されたイベント</h2><div className="item"><strong>{item.date}</strong> [{item.time_slot}]</div><div className="item"><span className="tag">タイトル</span> <span style={{marginLeft:8}}>{item.title}</span></div><div className="item"><span className="tag">作成者</span> <span style={{marginLeft:8}}>{item.created_by}</span></div><div className="item"><span className="tag">作成日時</span> <span style={{marginLeft:8}}>{item.created_at}</span></div></div></div>) }