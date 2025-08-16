import React, { useEffect, useMemo, useState } from 'react'
import Personal from './pages/Personal.jsx'
import Shared from './pages/Shared.jsx'
import SharePublic from './pages/SharePublic.jsx'
import Login from './pages/Login.jsx'

function usePath(){
  const [path, setPath] = useState(window.location.pathname)
  useEffect(()=>{
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return ()=> window.removeEventListener('popstate', onPop)
  },[])
  return path
}

export default function App(){
  const path = usePath()

  // Public share page
  if (path.startsWith('/share/')) {
    const token = path.split('/share/')[1] || ''
    return <SharePublic token={token} />
  }

  // Login page
  if (path === '/login') return <Login />

  // Auth guard for app pages
  const [me,setMe]=useState(null)
  const [tab,setTab]=useState('personal')
  useEffect(()=>{
    (async()=>{
      try{
        const r = await fetch('/api/me')
        const d = await r.json()
        setMe(d)
        if (!d.loggedIn) history.replaceState(null, '', '/login')
      }catch(e){ history.replaceState(null, '', '/login') }
    })()
  },[])

  if(!me) return null
  if(!me.loggedIn) return null

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
