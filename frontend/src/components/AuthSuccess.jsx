// frontend/src/pages/AuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // URL から token を取得
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      // localStorage に保存
      localStorage.setItem("jwt", token);
      console.log("✅ JWT保存:", token);

      // ✅ 個人ページにリダイレクト
      navigate("/personal");
    } else {
      alert("ログインに失敗しました");
      navigate("/");
    }
  }, [location, navigate]);

  return <div>ログイン中...</div>;
};

export default AuthSuccess;
