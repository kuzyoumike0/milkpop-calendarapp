import React, { useState } from "react";
import axios from "axios";

export default function LinkPage() {
  const [title, setTitle] = useState("");
  const [linkId, setLinkId] = useState(null);

  const createLink = async () => {
    try {
      const res = await axios.post("/api/create-link", { title });
      setLinkId(res.data.linkId);
    } catch (err) {
      console.error(err);
      alert("リンク作成に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有リンク発行</h2>

      <div>
        <label>タイトル: </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 飲み会調整"
        />
      </div>

      <button onClick={createLink} style={{ marginTop: "10px" }}>
        リンク作成
      </button>

      {linkId && (
        <div style={{ marginTop: "20px" }}>
          <p>共有リンク:</p>
          <a href={`/share/${linkId}`} target="_blank" rel="noopener noreferrer">
            {window.location.origin}/share/{linkId}
          </a>
        </div>
      )}
    </div>
  );
}
