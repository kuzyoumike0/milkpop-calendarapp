import React, { useState, useEffect } from "react";
import { createEvent } from "./api";

export default function EventModal({ date, token, onClose, refresh }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    // 他ユーザー一覧を取得（バックエンドで /users GET 必要）
    fetch("http://localhost:5000/api/users", {
      headers: { Authorization: "Bearer " + token },
    })
      .then(res => res.json())
      .then(data => setUsers(data.filter(u => u.id !== null)));
  }, [token]);

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createEvent(
      { title, description, date, time_slot: "終日", is_shared: isShared, participants: selectedUsers },
      token
    );
    refresh();
    onClose();
  };

  return (
    <div style={{ position:"fixed", top:0,left:0,right:0,bottom:0, background:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center" }}>
      <div style={{ background:"white", padding:"24px", borderRadius:"8px", width:"320px" }}>
        <h3>予定を追加 ({date.toDateString()})</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>タイトル:</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} required />
          </div>
          <div>
            <label>詳細:</label>
            <input value={description} onChange={e=>setDescription(e.target.value)} />
          </div>
          <div>
            <label>
              <input type="checkbox" checked={isShared} onChange={e=>setIsShared(e.target.checked)} />
              共有
            </label>
          </div>
          {isShared && (
            <div style={{ marginTop:"8px" }}>
              <label>参加者:</label>
              {users.map(u => (
                <div key={u.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                    />
                    {u.name}
                  </label>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop:"12px" }}>
            <button type="submit">作成</button>
            <button type="button" onClick={onClose} style={{ marginLeft:"8px" }}>キャンセル</button>
          </div>
        </form>
      </div>
    </div>
  );
}
