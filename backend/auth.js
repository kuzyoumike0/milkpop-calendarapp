// backend/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import pool from "./db.js";

const router = express.Router();

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

// ==== 認可画面へ ====
router.get("/discord", (_req, res) => {
  const scope = encodeURIComponent("identify");
  const url = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(
    DISCORD_CLIENT_ID
  )}&response_type=code&redirect_uri=${encodeURIComponent(
    DISCORD_REDIRECT_URI
  )}&scope=${scope}`;
  res.redirect(url);
});

// ==== ログアウト ====
router.get("/logout", (req, res) => {
  const isProd = NODE_ENV === "production";
  res.clearCookie("token", {
    path: "/",
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
  });
  res.redirect(FRONTEND_URL || "/");
});

// ==== コールバック ====
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

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // ユーザー情報取得
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userRes.json();

    // DB保存
    const upsert = await pool.query(
      `
      INSERT INTO public.users (discord_id, username, access_token, refresh_token)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (discord_id) DO UPDATE
        SET username=EXCLUDED.username,
            access_token=EXCLUDED.access_token,
            refresh_token=EXCLUDED.refresh_token
      RETURNING id
      `,
      [userData.id, userData.username, accessToken, refreshToken]
    );
    const userId = upsert.rows[0].id;

    // JWT発行（snake_caseに統一）
    const jwtToken = jwt.sign(
      {
        id: userId,
        discord_id: userData.id, // ✅ snake_case に修正
        username: userData.username,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isProd = NODE_ENV === "production";
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // フロントの /me にリダイレクト
    res.redirect(`${FRONTEND_URL}/me`);
  } catch (err) {
    console.error("Discord callback error:", err);
    res.status(500).send("Discordログインに失敗しました");
  }
});

export default router;
