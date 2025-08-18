import React from "react";
import { useParams, Link } from "react-router-dom";

export default function LinkPage() {
  const { id } = useParams();
  return (
    <div style={{padding:"24px"}}>
      <h2>🔗 共有リンク</h2>
      <p>リンクID: <b>{id}</b></p>
      <p><Link to={`/share/${id}`}>共有リンク先ページへ</Link></p>
    </div>
  );
}
