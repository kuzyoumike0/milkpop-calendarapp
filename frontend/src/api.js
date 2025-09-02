// frontend/src/api.js
// 認証は HttpOnly Cookie を正とする（Authorization ヘッダは使わない）

export const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_API_BASE_URL) ||
  "";

// 共通リクエスト関数（Cookie送信を必須）
async function request(path, { method = "GET", body, headers = {} } = {}) {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include", // ← Cookie 必須
  });

  if (res.status === 401) {
    const text = await res.text().catch(() => "");
    const error = new Error(text || "認証エラー（401）");
    error.status = 401;
    throw error;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const error = new Error(text || `APIエラー: ${res.status}`);
    error.status = res.status;
    throw error;
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await res.json();
  return await res.text();
}

/* ========= 認証関連 ========= */

// ログインURL（Discord OAuth に遷移）
export function getLoginUrl() {
  return `${BASE_URL}/auth/discord`;
}

// ログアウト（localStorageの互換トークンを掃除してから /auth/logout に遷移）
export function logoutRedirect() {
  try {
    localStorage.removeItem("jwt"); // 互換で残っていた場合に備えて必ず消す
  } catch {}
  // サーバ側でCookie削除→フロントにリダイレクト
  window.location.href = `${BASE_URL}/auth/logout`;
}

// サーバでログイン確認
export async function getMe() {
  return request("/api/me");
}

/* ========= アプリAPI ========= */

// 個人スケジュール一覧（share_url含む）
export async function listPersonalEvents() {
  return request("/api/personal-events");
}

// 個人スケジュール作成
export async function createPersonalEvent(payload) {
  return request("/api/personal-events", { method: "POST", body: payload });
}

// 個人スケジュール更新
export async function updatePersonalEvent(id, payload) {
  return request(`/api/personal-events/${id}`, { method: "PUT", body: payload });
}

// 個人スケジュール削除
export async function deletePersonalEvent(id) {
  return request(`/api/personal-events/${id}`, { method: "DELETE" });
}

// 共有スケジュール
export async function createSchedule(payload) {
  return request("/api/schedules", { method: "POST", body: payload });
}
export async function fetchScheduleByToken(shareToken) {
  return request(`/api/schedules/${shareToken}`);
}
