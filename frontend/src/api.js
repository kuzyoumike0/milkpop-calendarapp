// frontend/src/api.js
// ✅ 同一オリジン配信（Railway同一プロジェクト）を想定し、相対パスで叩く
//    どうしても別ドメインのAPIにしたい場合のみ REACT_APP_API_URL を設定してください。
const API_URL = (process.env.REACT_APP_API_URL || "").trim(); // 例: "" → 相対 /api

function url(path) {
  if (!API_URL) return path; // 相対
  return `${API_URL}${path}`;
}

// ---- schedules（共有用） ----
export async function fetchSharedSchedule(shareToken) {
  const res = await fetch(url(`/api/schedules/${shareToken}`), { credentials: "include" });
  if (!res.ok) throw new Error("共有スケジュール取得エラー");
  return res.json();
}

export async function createSharedSchedule(data) {
  const res = await fetch(url(`/api/schedules`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("共有スケジュール作成エラー");
  return res.json();
}

// ---- personal_schedules（個人用） ----
export async function createPersonalEvent(data) {
  const res = await fetch(url(`/api/personal-events`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("個人スケジュール作成エラー");
  return res.json();
}

export async function listPersonalEvents() {
  const res = await fetch(url(`/api/personal-events`), { credentials: "include" });
  if (!res.ok) throw new Error("個人スケジュール取得エラー");
  return res.json();
}

export async function sharePersonalEvent(id) {
  const res = await fetch(url(`/api/personal-events/${id}/share`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("個人スケジュール共有リンク発行エラー");
  return res.json();
}

export async function updatePersonalEvent(id, data) {
  const res = await fetch(url(`/api/personal-events/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("個人スケジュール更新エラー");
  return res.json();
}

export async function deletePersonalEvent(id) {
  const res = await fetch(url(`/api/personal-events/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("個人スケジュール削除エラー");
  return res.json();
}
