import React from "react";
import { useNavigate } from "react-router-dom";

export default function TopPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>カレンダーアプリへようこそ</h1>
      <p style={styles.subtitle}>どちらのページに移動しますか？</p>
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={() => navigate("/personal")}>
          個人用ページ
        </button>
        <button style={styles.button} onClick={() => navigate("/share")}>
          共有ページ
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#f9f9f9",
    fontFamily: "sans-serif",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "10px",
    color: "#333",
  },
  subtitle: {
    fontSize: "1.2rem",
    marginBottom: "30px",
    color: "#666",
  },
  buttonContainer: {
    display: "flex",
    gap: "20px",
  },
  button: {
    padding: "12px 24px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: "#4CAF50",
    color: "white",
    transition: "0.3s",
  },
};
