// フロントエンド用 API クライアント（DB直アクセス廃止版）
// 目的:
//  - 以前の `import ... from "./db.js"` を REST 経由に置換
//  - 以降はバックエンドの API を呼び出してデータ取得・更新を行う
// 使い方（推奨）:
//  import * as api from "./db.js";
//  const schedules = await api.listSchedules();
//  await api.createSchedule({ ... });
//
// バックエンドの実装想定エンドポイント（例）:
//  - GET    /api/schedules
//  - POST   /api/schedules
//  - GET    /api/schedules/:id
//  - PUT    /api/schedules/:id
//  - DELETE /api/schedules/:id
//  - POST   /api/shares           （共有リンク発行）
//  - GET    /api/shares           （共有リンク一覧）
//  - GET    /api/shares/:shareId
//  - POST   /api/shares/:shareId/responses  （共有ページでの〇✖保存）
//  - GET    /api/personal-schedules
//  - POST   /api/personal-schedules
//  - PUT    /api/personal-schedules/:id
//  - DELETE /api/personal-schedules/:id
//
// 既存の auth ユーティリティを利用して JWT を自動付与します。

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

// ファイルアップロード等、素の fetch が必要な場合
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

// ========== Schedules（共有用のベーススケジュールなど） ==========
export async function listSchedules(query = {}) {
  const qs = new URLSearchParams(query).toString();
  const path = qs ? `/api/schedules?${qs}` : `/api/schedules`;
  return await getJSON(path);
}

export async function getScheduleById(id) {
  return await getJSON(`/api/schedules/${encodeURIComponent(id)}`);
}

export async function createSchedule(payload) {
  // payload 例: { title, dates: ['2025-09-05','2025-09-09'], timeType, startTime, endTime, memo? }
  return await postJSON(`/api/schedules`, payload);
}

export async function updateSchedule(id, payload) {
  return await putJSON(`/api/schedules/${encodeURIComponent(id)}`, payload);
}

export async function deleteSchedule(id) {
  return await deleteJSON(`/api/schedules/${encodeURIComponent(id)}`);
}

// 共有リンク（URL）発行
export async function createShareLink(payload) {
  // payload 例: { scheduleId } または { title, dates, ... }（実装に合わせて）
  return await postJSON(`/api/shares`, payload);
}

// 共有リンク一覧（自分が作成したもの等）
export async function listShareLinks() {
  return await getJSON(`/api/shares`);
}

// 共有リンクの詳細（共有ページ表示など）
export async function getShareDetail(shareId) {
  return await getJSON(`/api/shares/${encodeURIComponent(shareId)}`);
}

// 共有ページでの回答保存（〇 / ✖）
export async function saveShareResponses(shareId, payload) {
  // payload 例: { name: "山田", responses: [{ date:"2025-09-05", status:"◯" }, ...] }
  return await postJSON(
    `/api/shares/${encodeURIComponent(shareId)}/responses`,
    payload
  );
}

// ========== Personal Schedules（個人日程） ==========
export async function listPersonalSchedules(query = {}) {
  const qs = new URLSearchParams(query).toString();
  const path = qs ? `/api/personal-schedules?${qs}` : `/api/personal-schedules`;
  return await getJSON(path);
}

export async function createPersonalSchedule(payload) {
  // payload 例:
  // {
  //   title, memo,
  //   dates: ['2025-09-10','2025-09-12']  // 複数 or 範囲をサーバー側で解釈
  //   mode: 'multiple' | 'range',
  //   timeType: 'allday' | 'day' | 'night' | 'custom',
  //   startTime?: '09:00', endTime?: '18:00',
  //   shareUrlTitlePairs?: [{ url, title }]
  // }
  return await postJSON(`/api/personal-schedules`, payload);
}

export async function updatePersonalSchedule(id, payload) {
  return await putJSON(`/api/personal-schedules/${encodeURIComponent(id)}`, payload);
}

export async function deletePersonalSchedule(id) {
  return await deleteJSON(`/api/personal-schedules/${encodeURIComponent(id)}`);
}

// ========== ユーザー関連 ==========
export async function getMe() {
  // ログイン中ユーザー情報（サーバー側で JWT から解決）
  return await getJSON(`/api/me`);
}

// ========== ユーティリティ・エクスポート ==========
export { API_BASE_URL };

// 互換目的：もし旧コードが `default export` を期待している場合に備え、
// よく使うメソッドをまとめて default で出す。
// （注意：旧来の `pool.query(sql, params)` 互換ではありません。置換が必要です）
const api = {
  getJSON,
  postJSON,
  putJSON,
  deleteJSON,
  rawFetch,

  listSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,

  createShareLink,
  listShareLinks,
  getShareDetail,
  saveShareResponses,

  listPersonalSchedules,
  createPersonalSchedule,
  updatePersonalSchedule,
  deletePersonalSchedule,

  getMe,
  API_BASE_URL,
};

export default api;
