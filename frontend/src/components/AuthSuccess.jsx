// frontend/src/components/AuthSuccess.jsx
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const AuthSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const userId = params.get("userId");
    const username = params.get("username");

    if (userId) {
      // ローカルに保存して他のページで利用可能にする
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", username);

      alert(`ログイン成功！ようこそ ${username} さん`);

      // ホームへリダイレクト
      navigate("/");
    }
  }, [params, navigate]);

  return <div>ログイン処理中...</div>;
};

export default AuthSuccess;
