// backend/auth.js
import express from "express";
//　import fetch from "node-fetch"; // npm install node-fetch@2
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

// --- Discord認証ページにリダイレクト ---
router.get("/discord", (req, res) => {
  const scope = encodeURIComponent("identify"); // ユーザー情報取得
  const discordAuthURL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}`;
  res.redirect(discordAuthURL);
});

// --- Discordからのコールバック処理 ---
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

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // --- ユーザー情報取得 ---
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userRes.json();

    // --- フロントにリダイレクト ---
    const redirectURL = `${FRONTEND_URL}/auth/success?userId=${userData.id}&username=${userData.username}`;
    res.redirect(redirectURL);

  } catch (err) {
    console.error(err);
    res.status(500).send("Discordログインに失敗しました");
  }
});

export default router;
