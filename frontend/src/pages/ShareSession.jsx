import React, { useEffect, useState } from 'react'

export default function ShareSession({ token }){
  const [info,setInfo]=useState(null); const [error,setError]=useState('')
  const [choices,setChoices]=useState({}) // date => 'x' or 'HH:MM-HH:MM'

  // build 24 hourly ranges + 'x'
  const timeRanges = (()=>{
    const arr=['x']
    for(let h=1; h<=23; h++){
      const s=String(h).padStart(2,'0')+':00'
      const e=String((h+1)%24).padStart(2,'0')+':00'
      arr.push(`${s}-${e}`)
    }
    arr.push('00:00-01:00')
    return arr
  })()

  useEffect(()=>{(async()=>{
    try{
      const r=await fetch('/api/shared/session/'+token)
      if(!r.ok){setError('リンクが無効です'); return}
      const d=await r.json(); setInfo(d)
      // default choice is 'x' or default start-end if provided
      const def = (d.start_time && d.end_time) ? `${d.start_time}-${d.end_time}` : 'x'
      const init={}; (d.allowed_dates||[]).forEach(dt=>{ init[dt]=def })
      setChoices(init)
    }catch{ setError('読み込みに失敗しました') }
  })()},[token])

  const setChoice=(date,val)=>setChoices(prev=>({...prev,[date]:val}))

  const submit=async(e)=>{
    e.preventDefault(); if(!info) return;
    const entries = Object.entries(choices).filter(([d,v])=>v && v.length>0)
    if(!entries.length){ alert('1件以上選択してください'); return }
    for(const [date,val] of entries){
      const time_slot = val==='x' ? 'x' : val
      await fetch('/api/shared/session/'+token+'/register',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({date, time_slot, title:'', member_name:''})
      })
    }
    alert('登録しました'); window.location.reload()
  }

  if(error){return <div className='container' style={{display:'grid',placeItems:'center'}}><div className='card'><h2>共有日程</h2><p style={{color:'#f59e0b'}}>{error}</p></div></div>}
  if(!info) return null

  // group existing by date for inline display
  const byDate = {}
  ;(info.existing||[]).forEach(it=>{
    byDate[it.date] = byDate[it.date] || []
    byDate[it.date].push(it)
  })

  return(<div className='container' style={{padding:'24px'}}>
    <div className='card' style={{maxWidth:980, margin:'0 auto'}}>
      <h2 style={{marginTop:0}}>共有日程 — {info.owner_name||'主催者'}</h2>
      <p className='small'>各日について、参加できない場合は「×」、可能な場合は時間帯（1時間刻み）を選んでください。</p>
      <form onSubmit={submit}>
        <ul className='list'>
          {(info.allowed_dates||[]).map(d=>(
            <li key={d} className='item' style={{gap:12, alignItems:'center'}}>
              <div style={{width:120,fontWeight:700}}>{d}</div>
              <select className='select strong' value={choices[d]||'x'} onChange={e=>setChoice(d,e.target.value)}>
                {timeRanges.map(opt=>(<option key={opt} value={opt}>{opt==='x'?'×（不可）':opt}</option>))}
              </select>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {(byDate[d]||[]).map((it,i)=>(
                  <span key={it.id||i} className='chip' title={(it.member_name||'')+': '+(it.time_slot||'')}>
                    🕒 {it.time_slot||'—'} {it.member_name?` / ${it.member_name}`:''}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <div className='row' style={{marginTop:12}}>
          <button className='button'>登録</button>
        </div>
      </form>
    </div>
  </div>)
}
