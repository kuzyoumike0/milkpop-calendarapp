import React from 'react';

export default function Login(){
  return (
    <div className="container" style={{display:'grid',placeItems:'center'}}>
      <div className="card" style={{maxWidth:520}}>
        <h2>ログイン</h2>
        <p style={{color:'#9aa0b4'}}>Google アカウントでログインしてください。</p>
        <a className="button" href="/auth/google/login">Googleでログイン</a>
      </div>
    </div>
  )
}
