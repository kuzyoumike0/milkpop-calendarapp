import React from "react";

export default function ShareButton({ url }) {
  return (
    url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "10px", padding: "10px 20px", background: "#004CA0", color: "white", borderRadius: "8px", textDecoration: "none" }}>
        共有ページを開く
      </a>
    ) : null
  );
}
