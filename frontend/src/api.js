import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api"
});

// ユーザー認証
export const register = (data) => API.post("/users/register", data);
export const login = (data) => API.post("/users/login", data);

// 予定
export const getEvents = (token) =>
  API.get("/events", { headers: { Authorization: "Bearer " + token } });

export const createEvent = (data, token) =>
  API.post("/events", data, { headers: { Authorization: "Bearer " + token } });
