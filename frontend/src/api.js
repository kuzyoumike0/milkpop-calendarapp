// frontend/src/api.js
// 共通APIラッパ。JWTは Authorization ヘッダ（localStorageのjwt）とし、401時は明示エラー。

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_API_BASE_URL) ||
  "";

// ローカル保存のJWTを取得
function getToken() {
  try {
    return localStorage.getItem("jwt") || "";
  } catch {
    return "";
  }
}

// 共通リクエスト関数
async function request(path, { method = "GET", body, headers = {} } = {}) {
  const token = getToken();
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (res.status === 401) {
    const text = await res.text().catch(() => "");
    const error = new Error(text || "認証エラー（401）。ログインが必要か、トークン期限切れです。");
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

/* ========= アプリ固有API ========= */

// 個人スケジュール一覧（share_url含む）
export async function listPersonalEvents() {
  return request("/api/personal-events");
}

// （互換）以前の名前で呼んでいる箇所があればこちら
export async function getPersonalEvents() {
  return listPersonalEvents();
}

// 個人スケジュール作成（作成時に共有リンクも発行される）
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

/* ========= 共有スケジュール（必要なら） ========= */

// 共有スケジュール作成
export async function createSchedule(payload) {
  return request("/api/schedules", { method: "POST", body: payload });
}

// 共有スケジュール取得（shareToken）
export async function fetchScheduleByToken(shareToken) {
  return request(`/api/schedules/${shareToken}`);
}
