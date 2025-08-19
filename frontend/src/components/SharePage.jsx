import React, { useState } from "react";
import axios from "axios";

export default function SharePage() {
  const [linkId, setLinkId] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreateLink = async () => {
    try {
      const res = await axios.post("/api/create-link");
      setLinkId(res.data.linkId);
      setCopied(false);
    } catch (err) {
      console.error(err);
      alert("共有リンクの発行に失敗しました");
    }
  };

  const handleCopy = () => {
    const url = `${window.location.origin}/share/${linkId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有リンク発行</h2>
      <button onClick={handleCreateLink}>共有リンクを発行する</button>

      {linkId && (
        <div style={{ marginTop: "20px" }}>
          <p>以下のURLを共有してください:</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/share/${linkId}`}
              style={{ flex: 1 }}
            />
            <button onClick={handleCopy}>
              {copied ? "✅ コピーしました" : "コピー"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
