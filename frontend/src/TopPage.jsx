import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./top.css";

export default function TopPage() {
  const navigate = useNavigate();

  // 共有リンク発行
  const createShareLink = async () => {
    try {
      const res = await axios.post("/api/share-link");
      const { url } = res.data;
      navigate(url); // `/share/:id` に遷移
    } catch (err) {
      console.error("共有リンク作成失敗:", err);
      alert("共有リンクの作成に失敗しました");
    }
  };

  return (
    <div className="top-container">
      <div className="glass-card">
        <h1>📅 スケジュール管理</h1>
        <p>利用したい機能を選んでください</p>

        <button className="menu-btn" onClick={() => navigate("/personal")}>
          個人スケジュール
        </button>

        <button className="menu-btn" onClick={createShareLink}>
          共有スケジュールを作成
        </button>
      </div>
    </div>
  );
}
