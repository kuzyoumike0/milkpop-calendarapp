import React, { useEffect, useState } from 'react'
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

  if (path.startsWith('/share/')) {
    const token = path.split('/share/')[1] || ''
    return <SharePublic token={token} />
  }
  if (path === '/login') return <Login />

  const [me,setMe]=useState(null)
  const [loading,setLoading]=useState(true)
  const [tab,setTab]=useState('personal')

  useEffect(()=>{
    (async()=>{
      try{
        const r = await fetch('/api/me')
        const d = await r.json()
        setMe(d)
        if (!d.loggedIn) {
          history.replaceState(null, '', '/login')
        }
      }catch(e){
        history.replaceState(null, '', '/login')
      } finally {
        setLoading(false)
      }
    })()
  },[])

  if (loading) {
    return (
      <div className="container" style={{display:'grid',placeItems:'center'}}>
        <div className="card" style={{maxWidth:420}}>
          <h2>読み込み中…</h2>
          <p style={{color:'#9aa0b4'}}>認証状態を確認しています。</p>
        </div>
      </div>
    )
  }

  if(!me || !me.loggedIn) return null

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
