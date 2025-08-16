import React, { useEffect, useState } from 'react'
export default function Login(){
  const [cfg,setCfg]=useState({googleConfigured:false,twitterConfigured:false,authMode:'optional'})
  useEffect(()=>{(async()=>{try{const r=await fetch('/api/config');if(r.ok)setCfg(await r.json())}catch{}})()},[])
  const err=new URLSearchParams(window.location.search).get('err')
  return(<div className="container" style={{display:'grid',placeItems:'center',minHeight:'100vh'}}>
    <div className="card" style={{maxWidth:560}}>
      <h2>ログイン</h2>
      {err&&<p style={{color:'#f59e0b'}}>認証に失敗しました: {err}</p>}
      <p className="small">ログインは任意です。未ログインでも使用できます。</p>
      <div className="row">
        {cfg.googleConfigured&&<a className="button" href="/auth/google">Googleでログイン</a>}
        {cfg.twitterConfigured&&<a className="button" href="/auth/twitter">Twitterでログイン</a>}
        <a className="button ghost" href="/auth/guest">ゲストではじめる</a>
      </div>
    </div>
  </div>) }