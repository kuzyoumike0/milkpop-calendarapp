// フロントエンド用 共通認証ユーティリティ（components 配下）
// 依存先コンポーネントからは `import { authFetchJson, getToken, setToken, isAuthenticated, API_BASE_URL } from "./auth.js";` で利用

// APIベースURL（Railwayなどで環境変数が無い場合は 5000 番にフォールバック）
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.BASE_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : "http://localhost:5000");

// localStorage に保存するJWTキー
const JWT_KEY = "jwt";

// JWT 取得
export function getToken() {
  try {
    return localStorage.getItem(JWT_KEY) || "";
  } catch {
    return "";
  }
}

// JWT 保存/削除
export function setToken(token) {
  try {
    if (token) localStorage.setItem(JWT_KEY, token);
    else localStorage.removeItem(JWT_KEY);
  } catch {
    // no-op
  }
}

// ログアウト用（削除だけ）
export function clearToken() {
  try {
    localStorage.removeItem(JWT_KEY);
  } catch {
    // no-op
  }
}

// 簡易認証判定
export function isAuthenticated() {
  const t = getToken();
  return typeof t === "string" && t.length > 0;
}

// 認証付き fetch ラッパ（JSON以外も可）
export async function authFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const token = getToken();

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const resp = await fetch(url, { ...options, headers });
  return resp;
}

// JSON を返すヘルパ
export async function authFetchJson(path, options = {}) {
  const resp = await authFetch(path, options);
  const contentType = resp.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await resp.json();
  } else {
    const text = await resp.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!resp.ok) {
    const message =
      (data && (data.error || data.message)) ||
      `HTTP ${resp.status} ${resp.statusText}`;
    const err = new Error(message);
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  return data;
}
