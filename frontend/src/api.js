// frontend/src/api.js
// 共通APIラッパ。JWTを必ず付けて401時の扱いを統一。

const BASE_URL = import.meta?.env?.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL || "";

function getToken() {
  try {
    return localStorage.getItem("jwt") || "";
  } catch {
    return "";
  }
}

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
    credentials: "include", // Cookie運用していなくてもCORS安定化に寄与
  });

  if (res.status === 401) {
    // 統一的にエラーへ
    const text = await res.text().catch(() => "");
    const msg = text || "認証エラー（401）。ログインが必要か、トークン期限切れです。";
    const error = new Error(msg);
    error.status = 401;
    throw error;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const error = new Error(text || `APIエラー: ${res.status}`);
    error.status = res.status;
    throw error;
  }

  // JSON でないことも想定して分岐
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await res.json();
  }
  return await res.text();
}

// ====== アプリ固有API ======

export async function getPersonalEvents() {
  return request("/api/personal-events");
}

export async function createPersonalEvent(payload) {
  return request("/api/personal-events", { method: "POST", body: payload });
}

export async function updatePersonalEvent(id, payload) {
  return request(`/api/personal-events/${id}`, { method: "PUT", body: payload });
}

export async function deletePersonalEvent(id) {
  return request(`/api/personal-events/${id}`, { method: "DELETE" });
}
