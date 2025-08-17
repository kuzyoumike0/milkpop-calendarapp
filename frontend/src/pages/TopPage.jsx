import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TopPage() {
  const navigate = useNavigate();

  const handleCreateShared = async () => {
    const res = await axios.post("/api/createShareLink");
    const shareId = res.data.shareId;
    navigate(`/shared/${shareId}`);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px", color: "white" }}>
      <h1>ようこそ MilkpopCalendar へ</h1>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "40px" }}>
        <button onClick={handleCreateShared} style={buttonStyle}>共有スケジュール作成</button>
        <button onClick={() => navigate("/personal")} style={buttonStyle}>個人スケジュール作成</button>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: "20px 40px",
  fontSize: "18px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#FDB9C8",
  color: "#000",
  fontWeight: "bold",
  transition: "0.3s"
};
