import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function TopPage() {
  const navigate = useNavigate();
  const createShareLink = async () => {
    const res = await fetch("/api/generateShare", { method: "POST" });
    const data = await res.json();
    navigate(`/shared/${data.shareId}`);
  };
  return (
    <Layout>
      <h2 style={{ color: "#FDB9C8", textAlign:"center" }}>トップページ</h2>
      <div style={{ textAlign:"center", marginTop:"2rem" }}>
        <button onClick={createShareLink} style={{ padding:"1rem 2rem", fontSize:"1.1rem", border:"none", borderRadius:"8px", background:"#004CA0", color:"#FDB9C8", fontWeight:"bold" }}>新しい共有リンクを発行</button>
      </div>
    </Layout>
  );
}
