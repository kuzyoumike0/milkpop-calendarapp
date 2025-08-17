import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div style={{padding:"20px"}}>
      <h2>ようこそ MilkpopCalendar へ</h2>
      <p><Link to="/personal">個人スケジュールを作成</Link></p>
      <p><Link to="/shared">共有スケジュールを作成</Link></p>
    </div>
  );
}
