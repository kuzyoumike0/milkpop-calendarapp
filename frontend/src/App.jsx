import React, { useEffect, useState } from 'react'
import Login from './pages/Login.jsx'
import Personal from './pages/Personal.jsx'
import Shared from './pages/Shared.jsx'
import Events from './pages/Events.jsx'
import SharePublic from './pages/SharePublic.jsx'

function usePath(){
  const [path, setPath] = useState(window.location.pathname)
  useEffect(()=>{
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return ()=> window.removeEventListener('popstate', onPop)
  },[])
  return path
}
const goto = (p)=>{ history.pushState(null,'',p); window.dispatchEvent(new PopStateEvent('popstate')) }

export default function App(){
  const path = usePath()
  if (path.startsWith('/share/')) {
    const token = path.split('/share/')[1] || ''
    return <SharePublic token={token} />
  }
  if (path === '/login') return <Login />

  const [me,setMe]=useState(null)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    (async()=>{
      try{
        const r = await fetch('/api/me', { credentials:'include' })
        const d = await r.json()
        setMe(d)
        if (!d.loggedIn) {
          // optional: 未ログインでも閲覧可能。トップでログインを促すUIにしてもOK
          if (window.location.pathname === '/') return
        } else if (window.location.pathname === '/') {
          goto(`/u/${d.slug}`)
        }
      }catch(e){
        // 失敗時は未ログイン扱い
      } finally {
        setLoading(false)
      }
    })()
  },[])

  if (loading) return <div className="container" style={{display:'grid',placeItems:'center'}}><div className="card"><h2>読み込み中…</h2></div></div>

  if (path === '/') {
    return (
      <div className="container">
        <header className="header">
          <h1>MilkPop Calendar</h1>
          <nav className="row">
            <a className="link" href="/login">ログイン</a>
          </nav>
        </header>
        <main className="main">
          <div className="card">
            <h2>ようこそ</h2>
            <p>ログインするとあなた専用のURL（/u/…）で個人・共有スケジュールを管理できます。未ログインでも閲覧・共有リンクの表示は可能です。</p>
            <div className="row">
              <a className="button" href="/login">ログインする</a>
            </div>
          </div>
        </main>
        <footer className="footer">© MilkPop</footer>
      </div>
    )
  }

  if (path.startsWith('/u/')){
    const rest = path.replace('/u/','')
    const [slug, sub] = rest.split('/')
    const onNav = (name)=> goto(`/u/${slug}${name==='shared'?'/shared': name==='events'?'/events':''}`)
    return (
      <div className="container">
        <header className="header">
          <h1>MilkPop Calendar</h1>
          <nav className="row">
            <a className={'link'+(!sub?' active':'')} onClick={()=>onNav('personal')}>個人</a>
            <a className={'link'+(sub==='shared'?' active':'')} onClick={()=>onNav('shared')}>共有</a>
            <a className={'link'+(sub==='events'?' active':'')} onClick={()=>onNav('events')}>イベント</a>
          </nav>
          <div className="row">
            {me?.loggedIn ? (<><span style={{color:'#9aa0b4',fontSize:12}}>{me.email} ({me.provider})</span><a className="link" href="/auth/logout">ログアウト</a></>) : <a className="link" href="/login">ログイン</a>}
          </div>
        </header>
        <main className="main">
          {!sub ? <Personal me={me}/> : sub==='shared' ? <Shared me={me}/> : <Events me={me} />}
        </main>
        <footer className="footer">© MilkPop</footer>
      </div>
    )
  }

  // 未知パスはトップへ
  goto('/')
  return null
}
