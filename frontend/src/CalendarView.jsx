import React, { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

function ymd(d){
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function CalendarView(){
  // カレンダーモード: 範囲 or 複数
  const [mode, setMode] = useState("range"); // "range" | "multi"

  // 範囲選択値（react-calendarのselectRange時は [Date, Date]）
  const [rangeValue, setRangeValue] = useState([new Date(), new Date()]);

  // 複数選択値（YYYY-MM-DDの配列で管理してシンプルに）
  const [multiDays, setMultiDays] = useState([]);

  // 区分（ラジオ：終日/昼/夜 か 時間指定）
  const [kind, setKind] = useState("allday"); // "allday" | "time"
  const [slot, setSlot] = useState("終日");   // 終日/昼/夜
  const [startH, setStartH] = useState("09");
  const [endH, setEndH]     = useState("18");

  const [title, setTitle] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  // 24時間（1〜0 の要件 → 表示は 1..24、値は 01..24 で 24=00 扱いも可）
  const hours = useMemo(() => Array.from({length:24}, (_,i)=>String(i).padStart(2,"0")), []);

  // === 範囲 → 日付配列に変換
  const rangeDates = useMemo(()=>{
    if (!Array.isArray(rangeValue)) return [];
    const [s, eRaw] = rangeValue;
    if (!s) return [];
    const e = eRaw || s;
    const list = [];
    const cur = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    const end = new Date(e.getFullYear(), e.getMonth(), e.getDate());
    while(cur <= end){
      list.push(ymd(cur));
      cur.setDate(cur.getDate()+1);
    }
    return list;
  },[rangeValue]);

  // === 送信するdates
  const dates = mode === "range" ? rangeDates : multiDays;

  // === 複数選択クリック
  const onClickDay = (date) => {
    if (mode !== "multi") return;
    const key = ymd(date);
    setMultiDays(prev => prev.includes(key) ? prev.filter(d=>d!==key) : [...prev, key]);
  };

  // === 範囲のタイル装飾（開始・終了・中日）
  const decorateRange = ({date, view})=>{
    if (view !== "month" || mode !== "range" || !Array.isArray(rangeValue)) return null;
    const [s, eRaw] = rangeValue;
    if (!s) return null;
    const e = eRaw || s;
    const d = ymd(date);
    const sKey = ymd(s);
    const eKey = ymd(e);
    if (d === sKey) return "range-start";
    if (d === eKey) return "range-end";
    // s<d<e
    const isBetween = (date > new Date(sKey) && date < new Date(eKey));
    return isBetween ? "in-range" : null;
  };

  // === 複数のタイル装飾
  const decorateMulti = ({date, view})=>{
    if (view !== "month" || mode !== "multi") return null;
    const key = ymd(date);
    return multiDays.includes(key) ? "selected-day" : null;
  };

  // === 共有リンク発行
  const onShare = async ()=>{
    if (dates.length === 0){
      alert("日付を選択してください。");
      return;
    }
    try{
      const payload = {
        dates,
        slotmode: kind,                     // バックエンドは slotmode カラム
        slot: kind === "allday" ? slot : null,
        start_time: kind === "time" ? startH : null,
        end_time: kind === "time" ? endH : null,
        title
      };
      const res = await axios.post("/api/share-link", payload);
      setShareUrl(res.data.url);
    }catch(err){
      console.error(err);
      alert("共有リンクの発行に失敗しました");
    }
  };

  return (
    <div className="grid">
      {/* カレンダー */}
      <section className="panel">
        <div className="row" style={{justifyContent:"space-between", marginBottom:8}}>
          <div className="row">
            <label className="radio">
              <input
                type="radio"
                name="mode"
                value="range"
                checked={mode==="range"}
                onChange={()=>setMode("range")}
              />
              範囲選択
            </label>
            <label className="radio">
              <input
                type="radio"
                name="mode"
                value="multi"
                checked={mode==="multi"}
                onChange={()=>setMode("multi")}
              />
              複数選択
            </label>
          </div>
          <div className="info">
            {mode==="range"
              ? `選択中: ${rangeDates[0] ?? "-"} 〜 ${rangeDates[rangeDates.length-1] ?? "-" }（${rangeDates.length}日）`
              : `選択中: ${multiDays.length}日`}
          </div>
        </div>

        <Calendar
          selectRange={mode==="range"}
          // 範囲モードでは onChange に [start, end] が来る
          onChange={(v)=>{
            if (mode==="range") setRangeValue(Array.isArray(v) ? v : [v,v]);
          }}
          // 複数モードではクリックでON/OFF
          onClickDay={onClickDay}
          // 装飾（範囲／複数の両方に対応）
          tileClassName={(args)=>{
            return decorateRange(args) || decorateMulti(args);
          }}
        />
      </section>

      {/* 右サイド：操作 */}
      <aside className="panel">
        <div className="controls">
          <div className="row">
            <label className="radio">
              <input
                type="radio"
                name="kind"
                value="allday"
                checked={kind==="allday"}
                onChange={()=>setKind("allday")}
              />
              終日・昼・夜
            </label>
            <label className="radio">
              <input
                type="radio"
                name="kind"
                value="time"
                checked={kind==="time"}
                onChange={()=>setKind("time")}
              />
              時間指定
            </label>
          </div>

          {kind==="allday" ? (
            <select value={slot} onChange={e=>setSlot(e.target.value)}>
              <option value="終日">終日</option>
              <option value="昼">昼</option>
              <option value="夜">夜</option>
            </select>
          ) : (
            <div className="time-row">
              <select value={startH} onChange={e=>setStartH(e.target.value)}>
                {hours.map(h=> <option key={h} value={h}>{parseInt(h,10)}:00</option>)}
              </select>
              <span>〜</span>
              <select value={endH} onChange={e=>setEndH(e.target.value)}>
                {hours.map(h=> <option key={h} value={h}>{parseInt(h,10)}:00</option>)}
              </select>
            </div>
          )}

          <input
            type="text"
            placeholder="予定タイトル（任意）"
            value={title}
            onChange={e=>setTitle(e.target.value)}
          />

          <button className="btn" onClick={onShare}>🔗 共有リンクを発行</button>

          {shareUrl && (
            <div className="share">
              <strong>共有リンク:</strong><br />
              <a href={shareUrl} target="_blank" rel="noreferrer">{shareUrl}</a>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
