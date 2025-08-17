import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import CalendarView from "./components/CalendarView";
import SharedView from "./components/SharedView";
import EventForm from "./components/EventForm";

export default function App(){
  return (
    <div>
      <div className="nav">
        <div className="nav-inner">
          <div className="brand">
            <span className="logo">MP</span>
            MilkPop Calendar
          </div>
          <nav style={{display:'flex', gap:8}}>
            <NavLink to="/" end className={({isActive})=> isActive ? 'active' : undefined}>カレンダー</NavLink>
            <NavLink to="/new" className={({isActive})=> isActive ? 'active' : undefined}>予定追加</NavLink>
          </nav>
        </div>
      </div>
      <div className="container">
        <div className="header">
          <div>
            <div className="kicker">SCHEDULE</div>
            <h1>共有カレンダー</h1>
            <div className="sub">全日 / 昼 / 夜で予定を整理。祝日表示対応。カレンダー切替に対応。</div>
          </div>
          <div className="actions">
            <a href="/new" className="btn">＋ 新規予定</a>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<CalendarView />} />
          <Route path="/new" element={<EventForm />} />
          <Route path="/share/:token" element={<ShareWrapper />} />
      </Routes>
      </div>
    </div>
  )
}

function ShareWrapper(){
  const params = window.location.pathname.split('/');
  const token = params[params.length-1];
  return <div className="container"><SharedView token={token} /></div>;
}
