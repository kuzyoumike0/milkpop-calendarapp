import React, { useEffect, useState } from "react";
import VoteMatrix from "./VoteMatrix";

function SharePage({ uuid }) {
  const [voterName, setVoterName] = useState("");
  const [confirmedName, setConfirmedName] = useState("");
  const [user, setUser] = useState(null); // Discordログイン情報

  // Discordログインしているかチェック
  useEffect(() => {
    fetch("/api/auth/user")
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setUser(data);
          setConfirmedName(data.username); // Discordユーザー名をそのまま使う
        }
      });
  }, []);

  const handleConfirm = () => {
    if (voterName.trim() !== "") {
      setConfirmedName(voterName.trim());
    }
  };

  // 名前未入力かつDiscordログインもしていない場合 → 入力モーダル
  if (!confirmedName) {
    return (
      <div className="name-modal">
        <div className="modal-content">
          <h2>あなたのお名前を入力してください</h2>
          <input
            type="text"
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            placeholder="例: 山田太郎"
          />
          <button onClick={handleConfirm}>OK</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>スケジュール調整表</h2>
      <VoteMatrix uuid={uuid} currentUser={confirmedName} />
    </div>
  );
}

export default SharePage;
