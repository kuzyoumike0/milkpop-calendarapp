import React from "react";
import CalendarView from "./CalendarView";
import "./styles.css";

export default function App() {
  return (
    <div className="app-shell">
      <div className="glass-card">
        <div className="header">
          <div className="title">📅 共有カレンダー</div>
          <div className="badge">Glam UI</div>
        </div>
        <CalendarView />
      </div>
    </div>
  );
}
