// frontend/src/components/db.js
// ✅ フロント用 API クライアント（DB直叩き廃止）
//    以前の `import ... from "./db.js"` を、このREST APIクライアントに置換する想定です。

import { authFetch, authFetchJson, API_BASE_URL } from "./auth.js";

// ========== 基本ユーティリティ ==========
export async function getJSON(path) {
  return await authFetchJson(path, { method: "GET" });
}

export async function postJSON(path, body) {
  return await authFetchJson(path, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

export async function putJSON(path, body) {
  return await authFetchJson(path, {
    method: "PUT",
    body: JSON.stringify(body ?? {}),
  });
}

export async function deleteJSON(path) {
  return await authFetchJson(path, { method: "DELETE" });
}

export async function rawFetch(path, options = {}) {
  const resp = await authFetch(path, options);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(
      `[rawFetch] ${resp.status} ${resp.statusText}: ${text || "(no body)"}`
    );
  }
  return resp;
}

// ========== schedules（共有用ベーススケジュール） ==========
export async function listSchedules(query = {}) {
  const qs = new URLSearchParams(query).toString();
  const path = qs ? `/api/schedules?${qs}` : `/api/schedules`;
  return await getJSON(path);
}

export async function getScheduleByShareToken(shareToken) {
  return await getJSON(`/api/schedules/${encodeURIComponent(shareToken)}`);
}

export async function createSchedule(payload) {
  // 例: { title, dates:[{date:'2025-09-10', timeType:'allday'|'day'|'night'|'custom', startTime?, endTime?}] }
  return await postJSON(`/api/schedules`, payload);
}

// ========== personal_schedules（個人日程） ==========
export async function listPersonalEvents() {
  return await getJSON(`/api/personal-events`);
}

export async function createPersonalEvent(payload) {
  // 例:
  // {
  //   title, memo,
  //   dates: [{date, timeType, startTime?, endTime?}],
  //   options: { mode?: 'multiple'|'range', shareUrlTitlePairs?: [{url, title}] }
  // }
  return await postJSON(`/api/personal-events`, payload);
}

export async function updatePersonalEvent(id, payload) {
  return await putJSON(`/api/personal-events/${encodeURIComponent(id)}`, payload);
}

export async function deletePersonalEvent(id) {
  return await deleteJSON(`/api/personal-events/${encodeURIComponent(id)}`);
}

export async function createPersonalShareLink(id) {
  // 共有リンク発行（backendで schedules にコピーし、share_token を返す）
  return await postJSON(`/api/personal-events/${encodeURIComponent(id)}/share`, {});
}

// ========== 共有ページでの回答保存（必要に応じて追加してください） ==========
// もし /api/shares/:shareId/responses のようなエンドポイントを用意する場合、ここに関数を追加

// ========== ユーザー関連 ==========
export async function getMe() {
  return await getJSON(`/api/me`);
}

// 互換用 default export（旧コードが default を期待している可能性に対応）
const api = {
  getJSON,
  postJSON,
  putJSON,
  deleteJSON,
  rawFetch,

  listSchedules,
  getScheduleByShareToken,
  createSchedule,

  listPersonalEvents,
  createPersonalEvent,
  updatePersonalEvent,
  deletePersonalEvent,
  createPersonalShareLink,

  getMe,
  API_BASE_URL,
};

export default api;
export { API_BASE_URL };
