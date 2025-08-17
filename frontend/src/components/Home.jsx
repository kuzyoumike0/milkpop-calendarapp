
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home(){
  const nav = useNavigate();
  const [token, setToken] = React.useState('');

  const goShare = (e)=>{
    e.preventDefault();
    if(!token) return;
    nav(`/share/${token}`);
  };

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="kicker">WELCOME</div>
          <h1>MilkPop Calendar</h1>
          <div className="sub">日付共有設定へようこそ。用途に合わせて機能を選んでください。</div>
        </div>
      </div>

      <div className="grid">
        <section className="col-8">
          <div className="panel">
            <div className="kicker">GET STARTED</div>
            <h3 style={{margin:'6px 0 12px'}}>よく使うアクション</h3>
            <div className="grid" style={{gridTemplateColumns: 'repeat(2, 1fr)'}}>
              
              <div className="card">
                    <h4 style={{marginTop:0}}>個人カレンダーを見る</h4>
                    <p className="sub">自分用のカレンダーをシンプルに表示します。</p>
                    <button className="btn" onClick={()=> nav('/personal')}>個人カレンダーへ</button>
                  </div>
                  <div className="card">
                <h4 style={{marginTop:0}}>予定を追加する</h4>
                <p className="sub">範囲/複数選択で日付を選び、予定を一括登録します。</p>
                <button className="btn" onClick={()=> nav('/new')}>予定追加へ</button>
              </div>
            </div>
          </div>
        </section>
        <aside className="col-4">
          <div className="panel">
            <div className="kicker">SHARE</div>
            <h3 style={{margin:'6px 0 12px'}}>共有リンクを開く</h3>
            <form className="form" onSubmit={goShare}>
              <div className="field">
                <label>共有トークン</label>
                <input type="text" placeholder="例) abcdef1234..." value={token} onChange={e=> setToken(e.target.value)} />
              </div>
              <button className="btn" type="submit">共有ビューを開く</button>
            </form>
            <hr className="sep" />
            <div className="note">「共有リンクを発行」ボタンで作成されるURLは <code>/share/&lt;token&gt;</code> 形式です。</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
