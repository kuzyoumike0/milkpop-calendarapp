import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SharePage() {
  const [linkId, setLinkId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 共有リンク発行
  const handleCreateShareLink = async () => {
    setLoading(true);
    try {
      // ✅ 修正: /api/shared → /api/share
      const res = await axios.post("/api/share", {}); 
      setLinkId(res.data.linkId);
    } catch (err) {
      console.error("共有リンク作成に失敗:", err);
      alert("共有リンクの作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 発行したリンク先に移動
  const goToLink = () => {
    if (linkId) {
      navigate(`/share/${linkId}`);
    }
  };

  return (
    <div className="share-container" style={{ padding: "20px" }}>
      <h2>共有リンク発行</h2>
      <p>共有リンクを発行すると、そのリンク先で誰でも予定を入力できます。</p>

      <button onClick={handleCreateShareLink} disabled={loading}>
        {loading ? "発行中..." : "共有リンクを発行"}
      </button>

      {linkId && (
        <div style={{ marginTop: "20px" }}>
          <p>
            共有リンクが発行されました:
            <br />
            <a
              href={`${window.location.origin}/share/${linkId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {window.location.origin}/share/{linkId}
            </a>
          </p>
          <button onClick={goToLink}>このリンク先に移動</button>
        </div>
      )}
    </div>
  );
}
