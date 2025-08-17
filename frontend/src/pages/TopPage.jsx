import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="container">
      <h1>トップページ</h1>
      <p>スケジュールの種類を選んでください</p>
      <div style={{display:"flex", gap:"1rem"}}>
        <Link to="/personal"><button>個人スケジュール</button></Link>
        <Link to="/shared"><button>共有スケジュール</button></Link>
      </div>
    </div>
  );
}
