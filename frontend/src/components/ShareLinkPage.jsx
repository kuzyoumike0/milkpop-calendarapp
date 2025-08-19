import React, { useState } from "react";
import axios from "axios";

export default function ShareLinkPage() {
  const [linkId, setLinkId] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const handleCreateLink = async () => {
    try {
      const res = await axios.post("/api/create-link");
      setLinkId(res.data.linkId);

      const url = `${window.location.origin}/share/${res.data.linkId}`;
      setShareUrl(url);
    } catch (err) {
      console.error("リンク作成失敗:", err);
      alert("リンク作成に失敗しました");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有リンク発行ページ</h2>
      <p>ここで共有リンクを作成し、他の人とスケジュールを共有できます。</p>

      <button onClick={handleCreateLink}>共有リンクを作成</button>

      {shareUrl && (
        <div style={{ marginTop: "20px" }}>
          <p>発行された共有リンク:</p>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            {shareUrl}
          </a>
        </div>
      )}
    </div>
  );
}
