const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// 全スケジュール取得
export async function fetchSchedules() {
  const res = await fetch(`${API_URL}/api/schedules`);
  if (!res.ok) throw new Error("スケジュール取得エラー");
  return res.json();
}

// スケジュール追加
export async function addSchedule(data) {
  const res = await fetch(`${API_URL}/api/schedules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("スケジュール保存エラー");
  return res.json();
}

// スケジュール更新
export async function updateSchedule(id, data) {
  const res = await fetch(`${API_URL}/api/schedules/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("スケジュール更新エラー");
  return res.json();
}

// スケジュール削除
export async function deleteSchedule(id) {
  const res = await fetch(`${API_URL}/api/schedules/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("スケジュール削除エラー");
  // DELETE は 204 のことが多いので安全に処理
  return res.status === 204 ? null : res.json();
}

// ✅ default export を追加
export default {
  fetchSchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule,
};
