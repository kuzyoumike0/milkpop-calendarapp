// backend/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "./db.js"; // pg Pool

const router = express.Router();

// ==== 必須環境変数チェック ====
const {
  JWT_SECRET,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  FRONTEND_URL,
} = process.env;

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set");
  process.exit(1);
}

for (const [k, v] of Object.entries({
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  FRONTEND_URL, // 未設定でも動くように後段でフォールバック済み
})) {
  if (!v) console.warn(`WARN: ${k} is not set`);
}

// ==== users テーブル初期化 ====
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
  console.log("✅ users table ensured");
} catch (e) {
  console.error("❌ users table bootstrap failed:", e.message);
}

// ==== Discord OAuth2 ====

// 認可画面へ（state でCSRF対策）
router.get("/discord", (req, res) => {
  try {
    const scope = encodeURIComponent("identify");
    const state = crypto.randomUUID();

    // 10分だけ有効な state を Cookie に保存（Lax でトップレベル遷移時は送信される）
    res.cookie("oauth_state", state, {
      httpOnly: true,
      secure: true, // 本番は https 前提
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    });

    const url =
      `https://discord.com/oauth2/authorize` +
      `?client_id=${encodeURIComponent(DISCORD_CLIENT_ID || "")}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI || "")}` +
      `&scope=${scope}` +
      `&state=${encodeURIComponent(state)}`;

    return res.redirect(url);
  } catch (err) {
    console.error("Auth start error:", err);
    return res.status(500).send("認可開始に失敗しました");
  }
});

// ログアウト（localStorage 方式なので Cookie はクリア不要、ただのリダイレクトでOK）
router.get("/logout", (req, res) => {
  // state Cookie が残っていれば削除
  res.clearCookie("oauth_state", { httpOnly: true, sameSite: "lax", secure: true });

  // FRONTEND_URL が無ければ現在のホストにフォールバック
  const base = FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
  return res.redirect(base);
});

// コールバック
router.get("/discord/callback", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  if (!code) return res.status(400).send("Codeがありません");

  try {
    // --- state 検証 ---
    const cookieState = req.cookies?.oauth_state;
    if (!cookieState || !state || cookieState !== state) {
      return res.status(400).send("state が不正です（CSRF防止）");
    }
    // 使い捨て
    res.clearCookie("oauth_state", { httpOnly: true, sameSite: "lax", secure: true });

    // === 1. アクセストークン取得 ===
    const params = new URLSearchParams();
    params.append("client_id", DISCORD_CLIENT_ID || "");
    params.append("client_secret", DISCORD_CLIENT_SECRET || "");
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", DISCORD_REDIRECT_URI || "");
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

    // === 2. ユーザー情報取得 ===
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      const text = await userRes.text();
      console.error("User fetch failed:", userRes.status, text);
      return res.status(502).send("Discordユーザー取得に失敗しました");
    }

    const userData = await userRes.json();

    // === 3. DB upsert ===
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

    // === 4. JWT 発行 ===
    const jwtToken = jwt.sign(
      {
        userId,
        discord_id: userData.id,
        username: userData.username,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // === 5. フロントの /auth/success に JWT を渡す ===
    // FRONTEND_URL が未設定でも落ちないようフォールバック
    const base = FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
    const redirect = new URL(`/auth/success?token=${encodeURIComponent(jwtToken)}`, base);

    return res.redirect(redirect.toString());
  } catch (err) {
    console.error("Discord callback error:", err);
    return res.status(500).send("Discordログインに失敗しました");
  }
});

export default router;
