import React, { useEffect, useState } from 'react'
import Login from './pages/Login.jsx'
import Personal from './pages/Personal.jsx'
import Shared from './pages/Shared.jsx'
import Events from './pages/Events.jsx'
import SharePublic from './pages/SharePublic.jsx'

function usePath(){const [p,setP]=useState(window.location.pathname);useEffect(()=>{const f=()=>setP(window.location.pathname);window.addEventListener('popstate',f);return()=>window.removeEventListener('popstate',f)},[]);return p}
const goto=(p)=>{history.pushState(null,'',p);window.dispatchEvent(new PopStateEvent('popstate'))}

export default function App(){
  const path = usePath()
  if(path.startsWith('/share/')){return <SharePublic token={path.split('/share/')[1]||''} />}
  if(path==='/login') return <Login />
  const [me,setMe]=useState(null),[loading,setLoading]=useState(true)
  useEffect(()=>{(async()=>{try{const r=await fetch('/api/me',{credentials:'include'});const d=await r.json();setMe(d);if(!d.loggedIn){if(window.location.pathname==='/')return}else if(window.location.pathname==='/'){goto(`/u/${d.slug}`)}}catch{}finally{setLoading(false)}})()},[])
  if(loading) return <div className="container" style={{display:'grid',placeItems:'center'}}><div className="card"><h2>読み込み中…</h2></div></div>
  if(path==='/'){return(<div className="container"><header className="header"><h1>MilkPop Calendar</h1><nav className="row"><a className="link" href="/login">ログイン</a></nav></header><main className="main"><div className="card"><h2>ようこそ</h2><p>ログインは任意です。ログインするとあなた専用のURL（/u/…）に遷移します。</p><div className="row"><a className="button" href="/login">ログインする</a></div></div></main><footer className="footer">© MilkPop</footer></div>)}
  if(path.startsWith('/u/')){const rest=path.replace('/u/','');const [slug,sub]=rest.split('/');const onNav=(name)=>goto(`/u/${slug}${name==='shared'?'/shared':name==='events'?'/events':''}`);return(<div className="container"><header className="header"><h1>MilkPop Calendar</h1><nav className="row"><a className={'link'+(!sub?' active':'')} onClick={()=>onNav('personal')}>個人</a><a className={'link'+(sub==='shared'?' active':'')} onClick={()=>onNav('shared')}>共有</a><a className={'link'+(sub==='events'?' active':'')} onClick={()=>onNav('events')}>イベント</a></nav><div className="row">{me?.loggedIn?(<><span style={{color:'#9aa0b4',fontSize:12}}>{me.email} ({me.provider})</span><a className="link" href="/auth/logout">ログアウト</a></>):<a className="link" href="/login">ログイン</a>}</div></header><main className="main">{!sub?<Personal/>:sub==='shared'?<Shared/>:<Events/>}</main><footer className="footer">© MilkPop</footer></div>)}goto('/');return null}