import React, { useState } from "react";

export default function SharePage() {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  const handleCreateLink = async () => {
    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/create-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("リンク作成失敗");

      const data = await res.json();
      if (data.linkId) {
        const newLink = `${window.location.origin}/links/${data.linkId}`;
        setLink(newLink);
      } else {
        setError("リンクIDが返ってきませんでした");
      }
    } catch (err) {
      console.error(err);
      setError("サーバーエラーが発生しました");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>共有リンク発行</h1>

      <div style={{ marginBottom: "10px" }}>
        <label>
          タイトル：
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 飲み会日程調整"
            style={{ marginLeft: "10px", padding: "4px" }}
          />
        </label>
      </div>

      <button onClick={handleCreateLink} style={{ padding: "6px 12px" }}>
        共有リンクを作成
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {link && (
        <div style={{ marginTop: "20px" }}>
          <p>共有リンクが発行されました：</p>
          <a href={link} target="_blank" rel="noopener noreferrer">
            {link}
          </a>
        </div>
      )}
    </div>
  );
}
