// /frontend/src/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 起動時にログイン状態を確認
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("no token");

        const res = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("unauthorized");

        const data = await res.json(); // { user: {...} }
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = async () => {
    // localStorage の jwt を削除
    localStorage.removeItem("jwt");
    // サーバー側のセッションも削除
    window.location.href = "/auth/logout";
  };

  const value = { user, setUser, loading, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
