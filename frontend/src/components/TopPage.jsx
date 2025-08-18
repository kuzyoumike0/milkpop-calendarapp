import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"radial-gradient(60% 60% at 50% 40%, rgba(255,255,255,.6), rgba(240,244,255,.8))"}}>
      <div style={{backdropFilter:"blur(12px)", background:"rgba(255,255,255,.55)", border:"1px solid rgba(255,255,255,.4)", borderRadius:24, padding:"32px 28px", boxShadow:"0 15px 40px rgba(0,0,0,.08)", width:360}}>
        <h1 style={{margin:0, fontSize:24}}>📅 カレンダーアプリ</h1>
        <p style={{opacity:.8, marginTop:8, marginBottom:20}}>共有・個人スケジュールを管理</p>
        <div style={{display:"grid", gap:12}}>
          <Link to="/share" style={btnStyle}>🌐 共有カレンダー</Link>
          <Link to="/personal" style={btnGhost}>👤 個人スケジュール</Link>
          <Link to="/link/demo" style={btnGhost}>🔗 共有リンク先（サンプル）</Link>
        </div>
      </div>
    </div>
  );
}

const brand = "#6C8CFF";
const btnStyle = {display:"block", textAlign:"center", padding:"12px 16px", borderRadius:12, background:brand, color:"#fff", textDecoration:"none", fontWeight:600};
const btnGhost = { ...btnStyle, background:"transparent", color:brand, border:`1px solid ${brand}` };
