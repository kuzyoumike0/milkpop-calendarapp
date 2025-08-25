// backend/auth.js
import express from "express";
//import fetch from "node-fetch";
import jwt from "jsonwebtoken";


// 起動時 (server.listen の前で1回だけ)
import pool from './db.js';
const r = await pool.query(`
  SELECT
    current_user,
    current_database() AS db,
    inet_server_addr()::text AS host,
    inet_server_port()   AS port,
    current_schema()      AS schema,
    setting               AS search_path
  FROM pg_settings WHERE name='search_path'
`);
console.log('DB DIAG:', r.rows[0]);  // ここで実際の接続先が分かる

const router = express.Router();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

// --- Discord 認証ページにリダイレクト ---
router.get("/discord", (req, res) => {
  const scope = encodeURIComponent("identify");
  const discordAuthURL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scope}`;
  res.redirect(discordAuthURL);
});

// --- Discord コールバック ---
router.get("/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Codeがありません");

  try {
     // --- トークン取得 ---
    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", REDIRECT_URI);
    params.append("scope", "identify");

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: params.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // --- ユーザー情報取得 ---
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userRes.json();
 
    // --- Postgres に保存 / 更新 ---
    const result = await pool.query(
      `INSERT INTO users (discord_id, username, access_token, refresh_token)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (discord_id)
       DO UPDATE SET username = EXCLUDED.username,
                     access_token = EXCLUDED.access_token,
                     refresh_token = EXCLUDED.refresh_token
       RETURNING id`,
      [userData.id, userData.username, accessToken, tokenData.refresh_token]
    );
    const userId = result.rows[0].id;

    // JWT を発行
    const jwtToken = jwt.sign(
      { userId, discordId: userData.id, username: userData.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // フロントにリダイレクト（JWT は URL パラメータで渡す）
    res.redirect(`${FRONTEND_URL}/auth/success?token=${jwtToken}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Discordログインに失敗しました");
  }
});

export default router;
