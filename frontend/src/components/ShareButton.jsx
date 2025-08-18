import React from "react";

export default function ShareButton({ link }) {
  if (!link) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      alert("リンクをコピーしました");
    } catch {
      alert("コピーに失敗しました");
    }
  };

  return (
    <div style={{display:"flex", alignItems:"center", gap:8}}>
      <a href={link} target="_blank" rel="noreferrer" style={{textDecoration:"none", color:"#6C8CFF", fontWeight:700}}>
        {link}
      </a>
      <button onClick={copy} style={{padding:"8px 10px", borderRadius:10, border:"1px solid #6C8CFF", background:"white", color:"#6C8CFF", fontWeight:700, cursor:"pointer"}}>
        コピー
      </button>
    </div>
  );
}
