// backend/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import pool from "./db.js";

const router = express.Router();
router.use(cookieParser());

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

/* =========================
 * DB: users テーブル初期化
 * ========================= */
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

/* =========================
 * JWT/Cookie ヘルパ
 * ========================= */
const isProd = NODE_ENV === "production";

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd, // 本番は true（Railway/HTTPS）
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * verifyJWT ミドルウェア
 * - Authorization: Bearer <token>
 * - もしくは Cookie: token=<jwt>
 * のどちらでも認証可能にする（フロントの実装差異を吸収）
 */
export function verifyJWT(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    let token = "";

    if (auth.startsWith("Bearer ")) {
      token = auth.slice(7);
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).send("Missing token");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    // 互換: 以前は { userId, discord_id, username }
    const userId = decoded.userId || decoded.sub || decoded.id;
    req.user = {
      id: userId,
      discord_id: decoded.discord_id,
      username: decoded.username,
      ...decoded,
    };

    return next();
  } catch (e) {
    return res.status(401).send("Invalid or expired token");
  }
}

/* =========================
 * Discord OAuth2
 * ========================= */

// 認可開始（state で CSRF 対策）
router.get("/discord", (req, res) => {
  try {
    const scope = encodeURIComponent("identify");
    const state = crypto.randomUUID();

    // 10分だけ有効な state を Cookie に保存
    res.cookie("oauth_state", state, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
      path: "/",
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

// ログアウト
router.get("/logout", (req, res) => {
  clearAuthCookie(res);
  res.clearCookie("oauth_state", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
  });
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
    res.clearCookie("oauth_state", {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
    });

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

    // === 5. HttpOnly Cookie にセット（推奨） ===
    setAuthCookie(res, jwtToken);

    // === 6. フロントへ遷移 ===
    // URL に token を載せる必要はない（Cookie があるため）。
    const base = FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
    const redirectUrl = new URL("/auth/success", base);
    return res.redirect(redirectUrl.toString());
  } catch (err) {
    console.error("Discord callback error:", err);
    return res.status(500).send("Discordログインに失敗しました");
  }
});

/* =========================
 * 便利エンドポイント
 * ========================= */

// ログイン済みユーザー情報（トークン検証）
router.get("/me", verifyJWT, async (req, res) => {
  try {
    const uid = req.user?.id;
    if (!uid) return res.status(404).send("ユーザーが見つかりません");

    const q = await pool.query(
      `SELECT id, discord_id, username FROM public.users WHERE id = $1`,
      [uid]
    );

    if (q.rowCount === 0) return res.status(404).send("ユーザーが見つかりません");

    return res.json(q.rows[0]);
  } catch (e) {
    console.error("auth/me error:", e);
    return res.status(500).send("ユーザー情報の取得に失敗しました");
  }
});

// トークンの有効性確認だけしたい時
router.get("/check", verifyJWT, (req, res) => {
  return res.json({ ok: true, user: { id: req.user?.id, username: req.user?.username } });
});

export default router;
