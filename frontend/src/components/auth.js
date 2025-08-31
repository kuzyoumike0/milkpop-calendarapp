// frontend/src/components/auth.js
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.BASE_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : "http://localhost:5000");

const JWT_KEY = "jwt";

export function getToken() {
  try { return localStorage.getItem(JWT_KEY) || ""; } catch { return ""; }
}
export function setToken(token) {
  try { token ? localStorage.setItem(JWT_KEY, token) : localStorage.removeItem(JWT_KEY); } catch {}
}
export function clearToken() {
  try { localStorage.removeItem(JWT_KEY); } catch {}
}
export function isAuthenticated() {
  const t = getToken(); return typeof t === "string" && t.length > 0;
}

export async function authFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const token = getToken();
  const defaultHeaders = { "Content-Type": "application/json" };
  const headers = token
    ? { ...defaultHeaders, ...(options.headers || {}), Authorization: `Bearer ${token}` }
    : { ...defaultHeaders, ...(options.headers || {}) };
  return fetch(url, { ...options, headers });
}

export async function authFetchJson(path, options = {}) {
  const resp = await authFetch(path, options);
  const ct = resp.headers.get("content-type") || "";
  let data = null;
  if (ct.includes("application/json")) data = await resp.json();
  else {
    const text = await resp.text();
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
  }
  if (!resp.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${resp.status} ${resp.statusText}`;
    const err = new Error(msg); err.status = resp.status; err.data = data; throw err;
  }
  return data;
}

// backend/auth.js のエンドポイントを利用するためのヘルパ
export function loginWithDiscord() {
  window.location.href = `${API_BASE_URL}/auth/discord`;
}
export function logout() {
  clearToken();
  window.location.href = `${API_BASE_URL}/auth/logout`;
}
export async function getMe() {
  return authFetchJson(`/api/me`);
}
