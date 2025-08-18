import React from "react";
import { useParams } from "react-router-dom";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  return (
    <div style={{ padding: 20 }}>
      <h2>共有リンクページ</h2>
      <p>リンクID: {linkId}</p>
    </div>
  );
}
