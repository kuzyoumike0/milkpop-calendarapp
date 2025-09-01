// frontend/src/pages/AuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Cookie が既にセットされているので token の確認は不要
    // /api/me を叩いて確認してもよい
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (res.ok) {
          console.log("✅ ログイン成功");
          navigate("/personal");
        } else {
          console.warn("❌ /api/me 失敗");
          navigate("/");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/");
      }
    };
    checkLogin();
  }, [navigate]);

  return <div>ログイン中...</div>;
};

export default AuthSuccess;
