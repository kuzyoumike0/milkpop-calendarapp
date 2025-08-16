import React, { useEffect, useMemo, useState } from 'react'
import Login from './pages/Login.jsx'
import Personal from './pages/Personal.jsx'
import Shared from './pages/Shared.jsx'
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
const goto = (p) => { history.pushState(null,'',p); window.dispatchEvent(new PopStateEvent('popstate')) }

export default function App(){
  const path = usePath()

  // 公開共有ページ
  if (path.startsWith('/share/')) {
    const token = path.split('/share/')[1] || ''
    return <SharePublic token={token} />
  }
  // ログインページ（常に表示可）
  if (path === '/login') return <Login />

  const [me,setMe]=useState(null)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    (async()=>{
      try{
        const r = await fetch('/api/me',{credentials:'include'})
        const d = await r.json()
        setMe(d)
        if(!d.loggedIn){
          window.location.replace('/login')
          return
        }
        // 自動遷移: ルートに来たら /u/:slug へ
        if (path==='/') {
          goto(`/u/${d.slug}`)
        }
      }catch(e){
        window.location.replace('/login')
      } finally {
        setLoading(false)
      }
    })()
  },[])

  if (loading) {
    return <div className="container" style={{display:'grid',placeItems:'center'}}>
      <div className="card"><h2>読み込み中…</h2></div>
    </div>
  }

  if (!me?.loggedIn) return null

  // ユーザー専用ルーティング
  // /u/:slug  または  /u/:slug/shared
  if (path.startsWith('/u/')){
    const rest = path.replace('/u/','')
    const [slug, sub] = rest.split('/')
    const isOwner = slug === me.slug
    if(!isOwner){
      // 他人のURLを叩いたら自分のページへリダイレクト
      goto(`/u/${me.slug}`)
      return null
    }
    const onNav = (name)=> goto(`/u/${me.slug}${name==='shared'?'/shared':''}`)
    return (
      <div className="container">
        <header className="header">
          <h1>MilkPop Calendar</h1>
          <nav className="nav">
            <a className={'link'+(!sub?' active':'')} onClick={()=>onNav('personal')}>個人</a>
            <a className={'link'+(sub==='shared'?' active':'')} onClick={()=>onNav('shared')}>共有</a>
          </nav>
          <div className="nav">
            <span style={{color:'#9aa0b4',fontSize:12}}>{me.email}</span>
            <a className="link" href="/auth/logout">ログアウト</a>
          </div>
        </header>
        <main className="main">
          {!sub ? <Personal/> : <Shared/>}
        </main>
        <footer className="footer">© MilkPop</footer>
      </div>
    )
  }

  // ここに来るのは直接 URL で /unknown の時。自分のトップへ。
  goto(`/u/${me.slug}`)
  return null
}
