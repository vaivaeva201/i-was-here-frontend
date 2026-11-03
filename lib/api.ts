import Constants from "expo-constants";

const { apiUrl } = Constants.expoConfig?.extra ?? {};

if (!apiUrl) {
  console.warn("⚠️ API_URL is missing. Check your .env file.");
}

export const BASE_URL = apiUrl;

// Endpoints
export const ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/log-in",
  LOGOUT: "/auth/log-out",
  REFRESH: "/auth/refresh-token",
  USER: (uuid: string) => `/users/${uuid}`,
};

// Generic POST helper
export async function apiPost(path: string, body: any) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return { ok: response.ok, data };
  } catch (err) {
    console.error("API POST error:", err);
    return { ok: false, data: { message: "Network error" } };
  }
}

// ----- LOGIN FUNCTION -----
export async function login(identifier: string, password: string) {
  // "identifier" can be username or email
  return apiPost(ENDPOINTS.LOGIN, { identifier, password });
}

// ----- REGISTER FUNCTION (unchanged) -----
export async function register(username: string, nickname: string, email: string, password: string) {
  return apiPost(ENDPOINTS.REGISTER, { username, nickname, email, password });
}
