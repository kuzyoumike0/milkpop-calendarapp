import React, { useState } from "react";
import { useParams } from "react-router-dom";

export default function SharedLink(){
  const { id } = useParams();
  const [username, setUsername] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">共有リンク: {id}</h2>
      <input className="glass w-full p-3" placeholder="ユーザー名" value={username} onChange={e=>setUsername(e.target.value)} />
      <input className="glass p-3" type="date" value={date} onChange={e=>setDate(e.target.value)} />
      <textarea className="glass w-full p-3" placeholder="メモ" value={memo} onChange={e=>setMemo(e.target.value)} />
      <div className="flex gap-2">
        <button className="btn-primary">登録（ダミー）</button>
        <button className="btn bg-brandPink text-brandBlack">編集（ダミー）</button>
        <button className="btn bg-brandBlack text-white">削除（ダミー）</button>
      </div>
      <div className="text-sm opacity-75">※ バックエンドAPI接続前のモックUIです。</div>
    </div>
  );
}
