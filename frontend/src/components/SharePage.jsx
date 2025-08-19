import React, { useState, useEffect } from "react";
import axios from "axios";

export default function SharePage({ linkId }) {
  const [mode, setMode] = useState("morning");
  const [timeSlot, setTimeSlot] = useState("");
  const [dates, setDates] = useState([]);
  const [username, setUsername] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    if (linkId) {
      axios.get(`/api/shared/${linkId}`).then((res) => setData(res.data));
    }
  }, [linkId]);

  const handleSave = async () => {
    if (!username || dates.length === 0) return alert("名前と日付を選んでください");

    await axios.post(`/api/shared/${linkId}`, {
      username,
      mode,
      timeSlot: mode === "custom" ? parseInt(timeSlot, 10) : null,
      dates,
    });

    const res = await axios.get(`/api/shared/${linkId}`);
    setData(res.data);
  };

  return (
    <div>
      <h2>共有スケジュール</h2>
      <input
        type="text"
        placeholder="名前"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <div>
        <label><input type="radio" value="morning" checked={mode==="morning"} onChange={()=>setMode("morning")} /> 朝</label>
        <label><input type="radio" value="afternoon" checked={mode==="afternoon"} onChange={()=>setMode("afternoon")} /> 昼</label>
        <label><input type="radio" value="evening" checked={mode==="evening"} onChange={()=>setMode("evening")} /> 夜</label>
        <label><input type="radio" value="allday" checked={mode==="allday"} onChange={()=>setMode("allday")} /> 全日</label>
        <label><input type="radio" value="custom" checked={mode==="custom"} onChange={()=>setMode("custom")} /> 時間指定</label>
      </div>

      {mode === "custom" && (
        <select value={timeSlot} onChange={(e)=>setTimeSlot(e.target.value)}>
          <option value="">時間を選択</option>
          {Array.from({ length: 24 }, (_, i) => i+1).map((h)=>(
            <option key={h} value={h}>{h}:00</option>
          ))}
        </select>
      )}

      <button onClick={handleSave}>保存</button>

      <h3>登録一覧</h3>
      <table border="1">
        <thead>
          <tr><th>日付</th><th>時間帯</th><th>ユーザー</th></tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.schedule_date}</td>
              <td>
                {row.mode === "morning" && "朝"}
                {row.mode === "afternoon" && "昼"}
                {row.mode === "evening" && "夜"}
                {row.mode === "allday" && "全日"}
                {row.mode === "custom" && `${row.time_slot}:00`}
              </td>
              <td>{row.username}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
