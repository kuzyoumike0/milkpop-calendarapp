// backend/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import pool from "./db.js"; // pg Pool（sslmode=require, rejectUnauthorized:false 推奨）

const router = express.Router();

// ==== 必須環境変数チェック ====
const {
  JWT_SECRET,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  FRONTEND_URL,
  NODE_ENV,
} = process.env;

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set");
  process.exit(1);
}

for (const [k, v] of Object.entries({
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  FRONTEND_URL,
})) {
  if (!v) console.warn(`WARN: ${k} is not set`);
}

// ==== 起動時: 接続先診断 + スキーマブートストラップ ====
// 失敗してもアプリ自体は起動を続ける（ログだけ出す）
try {
  const diag = await pool.query(`
    SELECT
      current_user,
      current_database() AS db,
      inet_server_addr()::text AS host,
      inet_server_port() AS port,
      current_schema() AS schema,
      (SELECT setting FROM pg_settings WHERE name = 'search_path') AS search_path
  `);
  console.log("DB DIAG:", diag.rows[0]);
} catch (e) {
  console.warn("DB DIAG failed:", e.message);
}

// 初期化（idempotent）
try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.users (
      id SERIAL PRIMARY KEY,
      discord_id TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT
    );
  `);
  console.log("users table ensured");
} catch (e) {
  console.error("users table bootstrap failed:", e.message);
  // ここで落としても良いが、一旦続行
}

// ==== ルーティング ====
// 認可画面へ
router.get("/discord", (_req, res) => {
  const scope = encodeURIComponent("identify");
  const url = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(
    DISCORD_CLIENT_ID
  )}&response_type=code&redirect_uri=${encodeURIComponent(
    DISCORD_REDIRECT_URI
  )}&scope=${scope}`;
  res.redirect(url);
});

//ログアウト
router.get("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    path: "/",
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
  });
  res.redirect(process.env.FRONTEND_URL || "/");
});

// コールバック
router.get("/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Codeがありません");

  try {
    // アクセストークン取得
    const params = new URLSearchParams();
    params.append("client_id", DISCORD_CLIENT_ID);
    params.append("client_secret", DISCORD_CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", DISCORD_REDIRECT_URI);
    params.append("scope", "identify");

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: params.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error("Token exchange failed:", tokenRes.status, text);
      return res.status(502).send("Discordトークン取得に失敗しました");
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    if (!accessToken) {
      console.error("No access_token in response:", tokenData);
      return res.status(502).send("Discordトークンが不正です");
    }

    // ユーザー情報取得
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      const text = await userRes.text();
      console.error("User fetch failed:", userRes.status, text);
      return res.status(502).send("Discordユーザー取得に失敗しました");
    }

    const userData = await userRes.json();

    // DB upsert（schemaを明示）
    const upsert = await pool.query(
      `
        INSERT INTO public.users (discord_id, username, access_token, refresh_token)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (discord_id) DO UPDATE
          SET username = EXCLUDED.username,
              access_token = EXCLUDED.access_token,
              refresh_token = EXCLUDED.refresh_token
        RETURNING id
      `,
      [userData.id, userData.username, accessToken, refreshToken]
    );

    const userId = upsert.rows[0].id;

    // JWT 発行
    const jwtToken = jwt.sign(
      {
        userId,
        discordId: userData.id,
        username: userData.username,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // --- ★ ここからクッキー発行＋/meへ ---
    const isProd = NODE_ENV === "production";
    // 別オリジンでAPIを叩くなら SameSite=None & Secure 必須（本番）
    // ローカル開発(http://localhost)では Secure=false / SameSite=Lax でOK
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: isProd, // 本番は true を推奨
      sameSite: isProd ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/", // ルート配下で送信
    });

    // フロントの /me へ
    const redirect = new URL("/me", FRONTEND_URL);
    return res.redirect(redirect.toString());
  } catch (err) {
    console.error("Discord callback error:", err);
    return res.status(500).send("Discordログインに失敗しました");
  }
});

export default router;
