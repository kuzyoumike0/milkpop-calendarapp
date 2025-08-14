import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "/api";

function Calendar() {
  const [shared, setShared] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [newShared, setNewShared] = useState({ date: "", period: "全日", title: "" });
  const [newPersonal, setNewPersonal] = useState({ shared_id: "", note: "" });
  const userId = "user1";

  useEffect(() => {
    fetchShared();
    fetchPersonal();
  }, []);

  const fetchShared = async () => {
    const res = await axios.get(`${API_URL}/shared`);
    setShared(res.data);
  };

  const fetchPersonal = async () => {
    const res = await axios.get(`${API_URL}/personal/${userId}`);
    setPersonal(res.data);
  };

  const addShared = async () => {
    if (!newShared.date || !newShared.title) return alert("日付とタイトル必須");
    await axios.post(`${API_URL}/shared`, newShared);
    setNewShared({ date: "", period: "全日", title: "" });
    fetchShared();
  };

  const addPersonal = async () => {
    if (!newPersonal.shared_id) return alert("共有予定を選択してください");
    await axios.post(`${API_URL}/personal`, { ...newPersonal, user_id: userId });
    setNewPersonal({ shared_id: "", note: "" });
    fetchPersonal();
  };

  return (
    <div>
      <h2>共有カレンダー</h2>
      <ul>
        {shared.map((s) => (
          <li key={s.id}>{s.date} - {s.period} : {s.title}</li>
        ))}
      </ul>

      <h3>新規共有予定追加</h3>
      <input type="date" value={newShared.date} onChange={(e) => setNewShared({...newShared, date: e.target.value})}/>
      <select value={newShared.period} onChange={(e) => setNewShared({...newShared, period: e.target.value})}>
        <option value="全日">全日</option>
        <option value="昼">昼</option>
        <option value="夜">夜</option>
      </select>
      <input type="text" placeholder="タイトル" value={newShared.title} onChange={(e) => setNewShared({...newShared, title: e.target.value})}/>
      <button onClick={addShared}>追加</button>

      <h2>個人カレンダー</h2>
      <ul>
        {personal.map((p) => (
          <li key={p.id}>{p.date} - {p.period} : {p.title} ({p.note})</li>
        ))}
      </ul>

      <h3>個人予定追加</h3>
      <select value={newPersonal.shared_id} onChange={(e) => setNewPersonal({...newPersonal, shared_id: e.target.value})}>
        <option value="">紐づける共有予定を選択</option>
        {shared.map((s) => (
          <option key={s.id} value={s.id}>{s.date} - {s.period} : {s.title}</option>
        ))}
      </select>
      <input type="text" placeholder="メモ" value={newPersonal.note} onChange={(e) => setNewPersonal({...newPersonal, note: e.target.value})}/>
      <button onClick={addPersonal}>追加</button>
    </div>
  );
}

export default Calendar;
