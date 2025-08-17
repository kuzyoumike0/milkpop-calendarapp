import React from "react";
import { Link } from "react-router-dom";

export default function App() {
  return (
    <div className="top-screen">
      <h1>カレンダーアプリ</h1>
      <div className="actions">
        <Link to="/share/new"><button>日付共有設定</button></Link>
        <Link to="/mycalendar"><button>個人カレンダー</button></Link>
      </div>
    </div>
  );
}
