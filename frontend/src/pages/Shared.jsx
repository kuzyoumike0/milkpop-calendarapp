import React, { useMemo, useState } from "react";
import axios from "axios";
import CalendarGrid from "../components/CalendarGrid";

export default function Shared(){
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-based
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("range"); // range | multi
  const [selected, setSelected] = useState([]);
  const [range, setRange] = useState({ from: "", to: "" });
  const [link, setLink] = useState("");

  const prevMonth = () => {
    let y = year, m = month - 1;
    if (m < 0) { m = 11; y -= 1; }
    setYear(y); setMonth(m);
  };
  const nextMonth = () => {
    let y = year, m = month + 1;
    if (m > 11) { m = 0; y += 1; }
    setYear(y); setMonth(m);
  };

  const onClickDate = (dateStr) => {
    if (mode === "multi") {
      setSelected(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]);
    } else {
      // range: first click sets from, second sets to and fills selected
      if (!range.from) {
        setRange({ from: dateStr, to: "" });
        setSelected([dateStr]);
      } else if (!range.to) {
        const from = range.from < dateStr ? range.from : dateStr;
        const to = range.from < dateStr ? dateStr : range.from;
        // fill range
        const dates = [];
        const start = new Date(from);
        const end = new Date(to);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(d.toISOString().slice(0,10));
        }
        setRange({ from, to });
        setSelected(dates);
      } else {
        // reset with new start
        setRange({ from: dateStr, to: "" });
        setSelected([dateStr]);
      }
    }
  };

  const publish = async () => {
    const dates = (mode === "multi") ? selected : selected;
    if (!title || dates.length === 0) {
      alert("タイトルと日付を選択してください");
      return;
    }
    const res = await axios.post("/api/share", { title, dates });
    const id = res.data.share_id;
    const origin = window.location.origin;
    setLink(`${origin}/share/${id}`);
  };

  const ym = `${year}年 ${month+1}月`;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">共有カレンダー（クリックで登録）</h2>
      <input className="glass w-full p-3" placeholder="タイトル" value={title} onChange={e=>setTitle(e.target.value)} />

      <div className="flex gap-6 items-center">
        <label><input type="radio" checked={mode==="range"} onChange={()=>{setMode("range"); setSelected([]); setRange({from:"",to:""});}} /> 範囲選択</label>
        <label><input type="radio" checked={mode==="multi"} onChange={()=>{setMode("multi"); setSelected([]); setRange({from:"",to:""});}} /> 複数選択</label>
      </div>

      <div className="flex items-center justify-between">
        <button className="btn" onClick={prevMonth}>← 前月</button>
        <div className="font-semibold">{ym}</div>
        <button className="btn" onClick={nextMonth}>次月 →</button>
      </div>

      <CalendarGrid year={year} month={month} selectedDates={selected} onClickDate={onClickDate} />

      <div className="text-sm">選択済み: {selected.join(", ") || "なし"}</div>

      <button className="btn-primary" onClick={publish}>🔗 共有リンクを発行</button>

      {link && (
        <div className="space-y-2">
          <div className="text-sm">発行URL:</div>
          <a className="text-brandBlue underline" href={link}>{link}</a>
        </div>
      )}
    </div>
  );
}
