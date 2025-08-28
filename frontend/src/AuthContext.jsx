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
        const res = await fetch("/api/me", { credentials: "include" });
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
    // GET版
    window.location.href = "/auth/logout";
    // もしPOSTにするなら:
    // await fetch("/auth/logout", { method: "POST", credentials: "include" });
    // setUser(null);
  };

  const value = { user, setUser, loading, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
