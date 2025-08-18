import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { id } = useParams(); // /share/:id
  const [events, setEvents] = useState([]);        // [{id, title, dates[], category, startTime, endTime}]
  const [participants, setParticipants] = useState({}); // { [eventId]: [{username, category, startTime, endTime}] }
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({});  // { [eventId]: { join: boolean, category, startTime, endTime } }

  useEffect(() => {
    // イベント取得
    (async () => {
      try {
        const ev = await axios.get(`/api/${id}/events`);
        setEvents(Array.isArray(ev.data) ? ev.data : ev.data?.events || []);
      } catch {
        setEvents([]);
      }
      // 参加者取得（存在しない場合は空でOK）
      try {
        const pr = await axios.get(`/api/${id}/participants`);
        setParticipants(pr.data || {});
      } catch {
        setParticipants({});
      }
    })();
  }, [id]);

  // ソート：最も早い日付 + startTime で昇順
  const sorted = useMemo(() => {
    const key = (e) => {
      const d = (e.dates && e.dates[0]) || e.date; // 互換
      const t = e.startTime || e.start || "00:00";
      return `${d ?? "9999-12-31"} ${t}`;
    };
    return [...events].sort((a,b)=> key(a) > key(b) ? 1 : -1);
  }, [events]);

  const hours = useMemo(()=>{
    const arr=[]; for(let h=0; h<24; h++){arr.push(`${String(h).padStart(2,"0")}:00`);} return arr;
  },[]);

  const updateResp = (eventId, patch) => {
    setResponses(prev => ({ ...prev, [eventId]: { ...prev[eventId], ...patch }}));
  };

  const saveParticipation = async () => {
    if (!username.trim()) { alert("ユーザー名を入力してください"); return; }
    const payload = { username, responses };
    try {
      await axios.post(`/api/${id}/join`, payload);
      // 送信後すぐに最新の参加状況を再取得して即時反映
      const pr = await axios.get(`/api/${id}/participants`);
      setParticipants(pr.data || {});
      alert("参加状況を保存しました");
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました（API未実装の可能性）");
    }
  };

  return (
    <div style={{padding:"24px"}}>
      <h2>🔗 共有リンク先: {id}</h2>

      <div style={{marginBottom:12}}>
        <input placeholder="ユーザー名" value={username} onChange={(e)=>setUsername(e.target.value)} />
        <button onClick={saveParticipation} style={saveBtn}>保存</button>
      </div>

      {sorted.map(ev => (
        <div key={ev.id} style={card}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div>
              <div style={{fontWeight:700}}>{ev.title}</div>
              <div style={{opacity:.7, fontSize:14}}>
                {(ev.dates && ev.dates.join(", ")) || ev.date} / {ev.category} / {(ev.startTime || ev.start) ?? "00:00"}〜{(ev.endTime || ev.end) ?? "00:00"}
              </div>
            </div>
          </div>

          {/* 参加入力 */}
          <div style={{marginTop:12}}>
            <label><input type="radio" name={`j-${ev.id}`} checked={responses[ev.id]?.join === true} onChange={()=>updateResp(ev.id,{join:true})}/> 参加</label>{" "}
            <label><input type="radio" name={`j-${ev.id}`} checked={responses[ev.id]?.join === false} onChange={()=>updateResp(ev.id,{join:false})}/> 不参加</label>
          </div>

          {responses[ev.id]?.join && (
            <div style={{display:"grid", gap:8, gridTemplateColumns:"1fr 1fr", marginTop:8}}>
              <div>
                区分：
                <select value={responses[ev.id]?.category || "終日"} onChange={(e)=>updateResp(ev.id,{category:e.target.value})}>
                  <option value="終日">終日</option>
                  <option value="昼">昼</option>
                  <option value="夜">夜</option>
                </select>
              </div>
              <div>
                時間：
                <select value={responses[ev.id]?.startTime || "00:00"} onChange={(e)=>updateResp(ev.id,{startTime:e.target.value})}>
                  {hours.map(h=><option key={h} value={h}>{h}</option>)}
                </select>{" "}
                〜{" "}
                <select value={responses[ev.id]?.endTime || "01:00"} onChange={(e)=>updateResp(ev.id,{endTime:e.target.value})}>
                  {hours.map(h=><option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* 参加者一覧 */}
          <div style={{marginTop:12}}>
            <div style={{fontSize:13, opacity:.7, marginBottom:6}}>参加者</div>
            <ul style={{margin:0, paddingLeft:18}}>
              {(participants[ev.id] || []).map((p, i)=>(
                <li key={i}>{p.username}（{p.category} / {p.startTime}〜{p.endTime}）</li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {sorted.length === 0 && <div style={{opacity:.7}}>登録済み日程がまだありません。</div>}
    </div>
  );
}

const card = { border:"1px solid rgba(0,0,0,.08)", borderRadius:12, padding:12, marginBottom:12, background:"#fff", boxShadow:"0 6px 16px rgba(0,0,0,.04)"};
const saveBtn = { marginLeft:8, padding:"8px 12px", borderRadius:10, border:"none", background:"#6C8CFF", color:"#fff", fontWeight:700, cursor:"pointer" };
