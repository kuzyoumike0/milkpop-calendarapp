import React, { useMemo, useState } from "react";
import axios from "axios";
import ShareButton from "./ShareButton";

export default function SharePage() {
  const [mode, setMode] = useState("multi"); // "multi" | "range"
  const [selectedDates, setSelectedDates] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("終日"); // 終日/昼/夜
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("01:00");
  const [shareLink, setShareLink] = useState("");

  // 今月の1〜末日まで自作カレンダー
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-based
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun
  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = new Date(year, month, d).toISOString().split("T")[0];
      cells.push(ds);
    }
    return cells;
  }, [year, month, daysInMonth, firstWeekday]);

  const onClickDate = (ds) => {
    if (!ds) return;
    if (mode === "multi") {
      setSelectedDates((prev) =>
        prev.includes(ds) ? prev.filter((x) => x !== ds) : [...prev, ds]
      );
    } else {
      // range
      if (selectedDates.length <= 1) {
        setSelectedDates([...(selectedDates[0] === ds ? [] : [ds])]);
      } else {
        setSelectedDates([ds]);
      }
      if (selectedDates.length === 1) {
        const a = new Date(selectedDates[0]);
        const b = new Date(ds);
        let start = a < b ? a : b;
        let end = a < b ? b : a;
        const range = [];
        const cur = new Date(start);
        while (cur <= end) {
          range.push(cur.toISOString().split("T")[0]);
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(range);
      }
    }
  };

  const timeOptions = useMemo(() => {
    const arr = [];
    for (let h = 0; h < 24; h++) {
      const hh = String(h).padStart(2, "0");
      arr.push(`${hh}:00`);
    }
    return arr;
  }, []);

  // 保存 → 毎回新しい共有リンクを発行し、そのリンクにイベントを保存
  const handleIssueAndSave = async () => {
    if (!title || selectedDates.length === 0) {
      alert("タイトルと日付を入力してください");
      return;
    }
    try {
      // 1) 共有リンク発行
      const cr = await axios.post("/api/create-share");
      const shareId = cr.data?.shareId || Math.random().toString(36).slice(2, 10);

      // 2) イベント保存（共有リンク先にぶら下げる）
      const payload = {
        title,
        dates: selectedDates,
        category,
        startTime,
        endTime,
      };
      await axios.post(`/api/${shareId}/events`, payload);

      // 3) 表示用リンク更新 & 入力リセット
      const url = `${window.location.origin}/share/${shareId}`;
      setShareLink(url);
      setTitle("");
      setSelectedDates([]);
    } catch (e) {
      console.error(e);
      // フォールバック：リンクだけ発行
      const shareId = Math.random().toString(36).slice(2, 10);
      const url = `${window.location.origin}/share/${shareId}`;
      setShareLink(url);
    }
  };

  return (
    <div style={{padding:"24px"}}>
      <h2>🌐 共有カレンダー</h2>

      {/* 選択モード */}
      <div style={{display:"flex", gap:12, alignItems:"center", marginBottom:12}}>
        <span>選択モード:</span>
        <label><input type="radio" value="multi" checked={mode==="multi"} onChange={(e)=>setMode(e.target.value)} /> 複数</label>
        <label><input type="radio" value="range" checked={mode==="range"} onChange={(e)=>setMode(e.target.value)} /> 範囲</label>
      </div>

      {/* タイトル */}
      <div style={{display:"grid", gap:8, maxWidth:420, marginBottom:12}}>
        <label>タイトル</label>
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="例）打合せ・会食 など" />
      </div>

      {/* 区分 + 時刻 */}
      <div style={{display:"grid", gap:8, gridTemplateColumns:"repeat(2, minmax(160px, 1fr))", alignItems:"center", maxWidth:520}}>
        <div>
          <label>区分</label><br/>
          <label><input type="radio" value="終日" checked={category==="終日"} onChange={(e)=>setCategory(e.target.value)} /> 終日</label>{" "}
          <label><input type="radio" value="昼" checked={category==="昼"} onChange={(e)=>setCategory(e.target.value)} /> 昼</label>{" "}
          <label><input type="radio" value="夜" checked={category==="夜"} onChange={(e)=>setCategory(e.target.value)} /> 夜</label>
        </div>
        <div>
          <label>時間（0時〜1時間刻み）</label><br/>
          <select value={startTime} onChange={(e)=>setStartTime(e.target.value)}>{timeOptions.map(t=><option key={t} value={t}>{t}</option>)}</select>
          {" 〜 "}
          <select value={endTime} onChange={(e)=>setEndTime(e.target.value)}>{timeOptions.map(t=><option key={t} value={t}>{t}</option>)}</select>
        </div>
      </div>

      {/* 自作カレンダー */}
      <div style={{marginTop:16}}>
        <div style={{display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:8}}>
          {["日","月","火","水","木","金","土"].map((w)=>(
            <div key={w} style={{textAlign:"center", fontWeight:600, opacity:.7}}>{w}</div>
          ))}
          {calendarCells.map((ds, i)=>(
            <div
              key={i}
              onClick={()=>onClickDate(ds)}
              style={{
                aspectRatio:"1 / 1",
                borderRadius:12,
                border:"1px solid rgba(0,0,0,.08)",
                background: ds && selectedDates.includes(ds) ? "#E7EDFF" : "white",
                display:"grid",
                placeItems:"center",
                cursor: ds ? "pointer" : "default",
                color: ds ? "#111" : "transparent",
                boxShadow: ds && selectedDates.includes(ds) ? "0 6px 16px rgba(108,140,255,.25)" : "none"
              }}
              title={ds || ""}
            >
              {ds ? Number(ds.split("-")[2]) : "•"}
            </div>
          ))}
        </div>
        <div style={{marginTop:10, fontSize:14, opacity:.8}}>
          選択中: {selectedDates.length ? selectedDates.join(", ") : "なし"}
        </div>
      </div>

      {/* 共有リンク発行＆保存 */}
      <div style={{marginTop:16, display:"flex", gap:10, alignItems:"center"}}>
        <button onClick={handleIssueAndSave} style={primaryBtn}>共有リンクを発行して保存</button>
        <ShareButton link={shareLink} />
      </div>
    </div>
  );
}

const primaryBtn = { padding:"10px 14px", borderRadius:10, background:"#6C8CFF", color:"#fff", border:"none", fontWeight:700, cursor:"pointer" };
