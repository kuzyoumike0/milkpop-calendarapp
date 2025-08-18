import React from "react";
import { useNavigate } from "react-router-dom";

export default function SharePage() {
  const navigate = useNavigate();

  // シェアリンクページは ID が必要なので、仮に "12345" を渡す例
  const handleGoToShareLink = () => {
    navigate("/sharelink/12345");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>共有ページ</h1>
      <p style={styles.subtitle}>ここから他のページに移動できます</p>

      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={() => navigate("/link")}>
          リンクページへ
        </button>
        <button style={styles.button} onClick={handleGoToShareLink}>
          シェアリンクページへ
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
    background: "#f0f8ff",
    fontFamily: "sans-serif",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "10px",
    color: "#333",
  },
  subtitle: {
    fontSize: "1rem",
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
    background: "#2196F3",
    color: "white",
    transition: "0.3s",
  },
};
