const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function fetchSchedules() {
  const res = await fetch(`${API_URL}/api/schedules`);
  return res.json();
}

export async function addSchedule(data) {
  const res = await fetch(`${API_URL}/api/schedules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateSchedule(id, data) {
  const res = await fetch(`${API_URL}/api/schedules/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
