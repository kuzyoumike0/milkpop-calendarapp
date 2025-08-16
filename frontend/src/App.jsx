import React, { useEffect, useState } from 'react'
import Login from './pages/Login.jsx'
import Personal from './pages/Personal.jsx'
import Shared from './pages/Shared.jsx'
import Events from './pages/Events.jsx'
import ShareUser from './pages/ShareUser.jsx'
import ShareSession from './pages/ShareSession.jsx'
function usePath(){const [p,setP]=useState(window.location.pathname);useEffect(()=>{const f=()=>setP(window.location.pathname);window.addEventListener('popstate',f);return()=>window.removeEventListener('popstate',f)},[]);return p}
const goto=(p)=>{history.pushState(null,'',p);window.dispatchEvent(new PopStateEvent('popstate'))}
export default function App(){
  const path=usePath()
  if(path.startsWith('/share/u/')){return <ShareUser token={path.split('/share/u/')[1]||''} />}
  if(path.startsWith('/share/s/')){return <ShareSession token={path.split('/share/s/')[1]||''} />}
  if(path==='/login') return <Login />
  const [me,setMe]=useState(null),[loading,setLoading]=useState(true)
  useEffect(()=>{(async()=>{
    try{
      const r=await fetch('/api/me',{credentials:'include'}); const d=await r.json(); setMe(d);
      if (window.location.pathname === '/') {
        if (d.loggedIn) goto(`/u/${d.user_id}`); else window.location.replace('/auth/guest')
      }
    }catch{}finally{setLoading(false)}
  })()},[])
  if(loading) return <div className="container" style={{display:'grid',placeItems:'center'}}><div className="card"><h2>読み込み中…</h2></div></div>
  if(path.startsWith('/u/')){
    const rest=path.replace('/u/',''); const [uid,sub]=rest.split('/')
    const onNav=(name)=>goto(`/u/${uid}${name==='shared'?'/shared':name==='events'?'/events':''}`)
    return(<div className="container">
      <header className="header">
        <div className="brand"><span className="dot"></span><h1 style={{margin:0}}>MilkPop Calendar</h1></div>
        <nav className="row">
          <a className={'link'+(!sub?' active':'')} onClick={()=>onNav('personal')}>個人</a>
          <a className={'link'+(sub==='shared'?' active':'')} onClick={()=>onNav('shared')}>共有</a>
          <a className={'link'+(sub==='events'?' active':'')} onClick={()=>onNav('events')}>イベント</a>
        </nav>
        <div className="row">{me?.loggedIn?(<>
          <span className="small">{me.email} ({me.provider})</span>
          <a className="link" href="/auth/logout">ログアウト</a>
        </>):<a className="link" href="/login">ログイン</a>}</div>
      </header>
      <main className="main">{!sub?<Personal/>:sub==='shared'?<Shared/>:<Events/>}</main>
      <footer className="footer">© MilkPop</footer>
    </div>)
  }
  return null
}