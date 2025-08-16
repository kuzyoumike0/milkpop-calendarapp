import React, { useEffect, useState } from 'react'
import Personal from './pages/Personal.jsx'
import Shared from './pages/Shared.jsx'

export default function App(){
  const [me,setMe]=useState(null)
  const [tab,setTab]=useState('personal')

  useEffect(()=>{
    (async()=>{
      try{
        const r = await fetch('/api/me')
        const d = await r.json()
        setMe(d)
      }catch(e){ setMe({loggedIn:false}) }
    })()
  },[])

  if(!me) return <div className="container"><div className="card" style={{margin:20}}>読み込み中...</div></div>
  if(!me.loggedIn){
    return (
      <div className="container" style={{display:'grid',placeItems:'center'}}>
        <div className="card" style={{maxWidth:520}}>
          <h2>ログインが必要です</h2>
          <p style={{color:'#9aa0b4'}}>Googleでログインして、スケジュールにアクセスしてください。</p>
          <a className="button" href="/auth/google/login">Googleでログイン</a>
          <div style={{marginTop:8}}>
            <a className="link" href="/auth/mock">デモログイン（開発用）</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>MilkPop Calendar</h1>
        <nav className="nav">
          <button className={'link'+(tab==='personal'?' active':'')} onClick={()=>setTab('personal')}>個人</button>
          <button className={'link'+(tab==='shared'?' active':'')} onClick={()=>setTab('shared')}>共有</button>
        </nav>
        <div className="nav">
          <span style={{color:'#9aa0b4', fontSize:12}}>{me.email}</span>
          <a className="link" href="/auth/logout">ログアウト</a>
        </div>
      </header>
      <main className="main">
        {tab==='personal'? <Personal/> : <Shared/>}
      </main>
      <footer className="footer">© MilkPop</footer>
    </div>
  )
}
