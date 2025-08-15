import React, { useState } from "react";
import MyCalendar from "./Calendar";
import { login, register } from "./api";

export default function App() {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register({ name, email, password });
      }
      const res = await login({ email, password });
      setToken(res.data.token);
    } catch (err) {
      alert("認証エラー");
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: "400px", margin: "40px auto" }}>
        <h2>{isRegister ? "新規登録" : "ログイン"}</h2>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <label>名前: </label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div>
            <label>メール: </label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label>パスワード: </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit">{isRegister ? "登録" : "ログイン"}</button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} style={{ marginTop: "12px" }}>
          {isRegister ? "ログイン画面へ" : "新規登録へ"}
        </button>
      </div>
    );
  }

  return <MyCalendar token={token} />;
}
