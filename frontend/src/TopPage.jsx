import React from "react";
import axios from "axios";

export default function TopPage() {
  const createShareLink = async () => {
    try {
      // バックエンドの /api/share で共有リンクを発行する前提
      const res = await axios.post("/api/share", { description: "トップから発行" });
      const url = (res.data && (res.data.shareUrl || res.data.url)) || "";
      if (!url) {
        alert("共有リンクのURLを取得できませんでした。バックエンド応答を確認してください。");
        return;
      }
      // 完全URLを表示
      const full = url.startsWith("http")
        ? url
        : `${window.location.origin}${url}`;
      alert(`共有リンクを発行しました:\n${full}`);
      // 必要なら自動遷移
      // window.location.href = full;
    } catch (e) {
      console.error(e);
      alert("共有リンクの発行に失敗しました。");
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={{ margin: 0 }}>📅 カレンダー</h1>
        <p style={{ opacity: 0.8, marginTop: 8 }}>トップメニュー</p>

        <div style={{ height: 16 }} />

        <button style={styles.btnPrimary} onClick={createShareLink}>
          🔗 共有リンクを発行
        </button>

        {/* 将来ここに「個人スケジュール」「共有カレンダーへ」等のボタンを追加 */}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #b3e5fc 0%, #e0f7fa 35%, #e8f1ff 100%)",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, 'Noto Sans JP', sans-serif",
    padding: 24,
  },
  card: {
    width: "min(560px, 96vw)",
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderRadius: 20,
    boxShadow: "0 12px 40px rgba(0,0,0,.15)",
    border: "1px solid rgba(255,255,255,.3)",
    padding: 24,
    textAlign: "center",
  },
  btnPrimary: {
    width: "100%",
    padding: "12px 20px",
    background: "linear-gradient(180deg, #2ecc71 0%, #27ae60 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(39,174,96,.25)",
  },
};
