import React, { useEffect, useState } from 'react'

export default function ShareSession({ token }){
  const [info,setInfo]=useState(null); const [error,setError]=useState('')
  const [name,setName]=useState(''); const [title,setTitle]=useState('')
  const [choices,setChoices]=useState({}) // date => { type:'x' | 'time', start:'HH:MM', end:'HH:MM' }
  const hourOptions=[...Array(23)].map((_,i)=>`${String(i+1).padStart(2,'0')}:00`).concat(['00:00'])

  useEffect(()=>{(async()=>{
    try{
      const r=await fetch('/api/shared/session/'+token)
      if(!r.ok){setError('リンクが無効です'); return}
      const d=await r.json(); setInfo(d); setTitle(d.default_title||'')
      const init={}; (d.allowed_dates||[]).forEach(dt=>{ init[dt]={type:'time', start:d.start_time||'09:00', end:d.end_time||'18:00'} })
      setChoices(init)
    }catch{ setError('読み込みに失敗しました') }
  })()},[token])

  const setType=(date,val)=>setChoices(prev=>({...prev,[date]:{...(prev[date]||{}),type:val}}))
  const setStart=(date,val)=>setChoices(prev=>({...prev,[date]:{...(prev[date]||{}),start:val}}))
  const setEnd=(date,val)=>setChoices(prev=>({...prev,[date]:{...(prev[date]||{}),end:val}}))

  const submit=async(e)=>{
    e.preventDefault(); if(!info) return;
    const entries = Object.entries(choices).filter(([d,c])=>c && (c.type==='x' || (c.start && c.end)))
    if(!entries.length){ alert('1件以上選択してください'); return }
    for(const [date,c] of entries){
      const time_slot = c.type==='x' ? 'x' : `${c.start}-${c.end}`
      await fetch('/api/shared/session/'+token+'/register',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({date, time_slot, title, member_name:name})
      })
    }
    alert('登録しました'); window.location.reload()
  }

  if(error){return <div className='container' style={{display:'grid',placeItems:'center'}}><div className='card'><h2>共有日程</h2><p style={{color:'#f59e0b'}}>{error}</p></div></div>}
  if(!info) return null

  return(<div className='container' style={{padding:'24px'}}>
    <div className='card' style={{maxWidth:980, margin:'0 auto'}}>
      <h2 style={{marginTop:0}}>共有日程 — {info.owner_name||'主催者'}</h2>
      <p className='small'>リンク先で、各日の参加可否（×）または時間帯（開始〜終了）をプルダウンで選んで登録できます。</p>
      <form onSubmit={submit} className='grid-form' style={{marginTop:12}}>
        <label>お名前</label><input className='input' value={name} onChange={e=>setName(e.target.value)} required />
        <label>タイトル</label><input className='input' value={title} onChange={e=>setTitle(e.target.value)} placeholder='議題など' />
        <div className='full'>
          <div className='card' style={{marginTop:8}}>
            <h3 style={{marginTop:0}}>日付ごとの回答</h3>
            <ul className='list'>
              {(info.allowed_dates||[]).map(d=>(
                <li key={d} className='item' style={{gap:12}}>
                  <div style={{width:120,fontWeight:700}}>{d}</div>
                  <label style={{display:'flex',alignItems:'center',gap:6}}>
                    <input type='radio' name={'t-'+d} checked={(choices[d]?.type||'time')==='time'} onChange={()=>setType(d,'time')} /> 時間指定
                  </label>
                  <label style={{display:'flex',alignItems:'center',gap:6}}>
                    <input type='radio' name={'t-'+d} checked={(choices[d]?.type||'time')==='x'} onChange={()=>setType(d,'x')} /> ×（不可）
                  </label>
                  {(choices[d]?.type||'time')==='time' && (<>
                    <select className='select strong' value={choices[d]?.start||''} onChange={e=>setStart(d,e.target.value)}>
                      {hourOptions.map(h=><option key={h} value={h}>{h}</option>)}
                    </select>
                    <span>〜</span>
                    <select className='select strong' value={choices[d]?.end||''} onChange={e=>setEnd(d,e.target.value)}>
                      {hourOptions.map(h=><option key={h} value={h}>{h}</option>)}
                    </select>
                  </>)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='full'><button className='button'>登録</button></div>
      </form>

      <h3 style={{marginTop:16}}>既存の登録</h3>
      <ul className='list'>{(info.existing||[]).map(it=>(<li key={it.id} className='item'><span className='chip time'>🕒 {it.time_slot}</span><span className='chip user'>👤 {it.member_name||'—'}</span><span style={{flex:1}}>{it.title}</span><span className='small'>{it.date}</span></li>))}</ul>
    </div>
  </div>)
}
